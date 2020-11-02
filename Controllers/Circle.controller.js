const {
    randCircleCode
} = require('../helpers/helper_functions')
const User = require('../Models/User.model')
const createError = require('http-errors')
const Circle = require('../Models/Circle.model')
const UserLocation = require('../Models/UserLocation.model')
const mongoose = require('mongoose')
const e = require('express')

const na = 'N/A'

module.exports = {
    createCircle: async (req, res, next) => {
        try {
            const userId = req.payload.aud

            
            //getting user document
            const userDoc = await User.findOne({ _id: userId })
            if (!userDoc) throw createError.NotFound('User Not Found!')

            let newCircleMembers = []
            //Check if user already in a circle
            if (userDoc.circle !== na) {
                //user in a circle -> download circle doc
                const userOldCircle = await Circle.findOne({ circle_code: userDoc.circle })
                if (userOldCircle) {
                    //check if user is an admin
                if (userOldCircle.admin_id === userId) {
                    //the user is admin of the circle -> get the count of the circle members
                    if (userOldCircle.members.length > 1)
                        throw createError.BadRequest('cannot leave old circle while you are an admin')
                    else await Circle.findByIdAndDelete(userOldCircle.id)
                } else {
                    userOldCircle.members.forEach(member => {
                        if (member._id !== userId) {
                            newCircleMembers.push(member)
                        }
                    })
                    //update the old circle with new members
                    await Circle.findByIdAndUpdate(userOldCircle.id, {members: newCircleMembers})
                }
                }            
            }


            const code = randCircleCode()
            const userDocObj = {
                _id: userDoc._id,
                email: userDoc.email,
                name: userDoc.name,
                circle: code,
                isAdmin: true,
                isSharing: userDoc.isSharing,
                photoUrl: userDoc.photoUrl,
                messageToken: userDoc.messageToken,

            }


            //update user doc
            await User.findByIdAndUpdate(userId, { circle: code, isAdmin: true })
            

            //create the circle doc
            const circleObj = {
                circle_code: code,
                accessibility: true,
                admin_id: userId,
                members: [userDocObj],
                messages:[]
            }

            //save circle doc
            const circle = new Circle(circleObj)
            await circle.save()    


            res.send({
                isSuccessfull: true,
                message: code
            })


        } catch (error) {
            next(error)
        }
        
    },

    joinCircle: async (req, res, next) => {
        try {
            const userId = req.payload.aud
            const code = req.params.circle_code

            const circle = await Circle.findOne({ circle_code: code })
            //check if circle exist
            if(!circle) throw createError.NotFound('circle does not exist!')
            //check circle accessibility
            if (!circle.accessibility) throw createError.Forbidden('the circle is locked by the admin')
            //query user doc and validate 
            const user = await User.findOne({_id: userId})
            if (!user) throw createError.NotFound('user not found!')

            if(user.circle === code) throw createError.Forbidden('You Already Joined this circle!')
            
            let newCircleMembers = []
            if (user.circle !== na) {
                //query user circle and check if he only in the circle 
                const userOldCircle = await Circle.findOne({ circle_code: user.circle })
                if (userOldCircle) {
                    //check if req came from admin
                if (user.isAdmin) {
                    if (userOldCircle.members.length > 1)
                        throw createError.BadRequest('Cannot leave old circle while you are an admin.')
                    else await Circle.findByIdAndDelete(userOldCircle.id)
                }
                else {
                    userOldCircle.members.forEach(member => {
                        if (member._id !== userId) {
                            newCircleMembers.push(member)
                        }
                    })
                    //update the old circle with new members
                    await Circle.findByIdAndUpdate(userOldCircle.id, {members: newCircleMembers})
                }
                }
                
            }

            //join new circle -> 1. update user doc, 2. add user doc to new circle members array
            await User.findByIdAndUpdate(userId, { circle: code, isAdmin: false })
            
            const userObj = {
                _id: user._id,
                email: user.email,
                name: user.name,
                circle: code,
                isAdmin: false,
                messageToken: user.messageToken,
                isSharing: user.isSharing,
                photoUrl: user.photoUrl,
            }
            const newJoiningCircleMembers = circle.members
            newJoiningCircleMembers.push(userObj)
            await Circle.findByIdAndUpdate(circle.id, { members: newJoiningCircleMembers })
            
            res.send({
                isSuccessfull: true,
                message: 'circle joined successfully'
            })

        } catch (error) {
            next(error)
        }
    },

    getCircleMembers: async (req, res, next) => {
        try {
            const userId = req.payload.aud
            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.NotFound()
            
            if (user.circle === na) throw createError.BadRequest('User Not Joined a Circle')
            
            const circle = await Circle.findOne({ circle_code: user.circle })
            if (!circle) throw createError.NotFound()

            const members = circle.members
            
            res.send(members)

        } catch (error) {
            next(error)
        }
    },

    getCircleMembersLocations: async (req, res, next) => {
        try {
            const userId = req.payload.aud
            //query user doc
            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.NotFound();
            if (user.circle === na) throw createError.BadRequest("user doesn't joined a circle")
            
            //query circle members
            const circle = await Circle.findOne({ circle_code: user.circle })
            if (!circle) throw createError.NotFound()
            

            let memLocRes = []
            let count = 0
            await new Promise((resolve, reject) => {
                circle.members.forEach(async member => {
                    try {
                        if (member.isSharing) {
                            const memberLastLoc = await UserLocation.aggregate([
                                {
                                    $match : {   _id: mongoose.Types.ObjectId(member._id) }
                                },
                                {
                                    $unwind: "$locationStack"
                                },
                       
                                {
                                    $sort: {"locationStack.timestamp": -1}
                                },
                                {
                                    $limit: 1
                                },
                                {
                                    $group: {
                                        _id: "$_id",
                                        latitude: { $first: "$locationStack.latitude" },
                                        longitude: { $first: "$locationStack.longitude" },
                                        timestamp: { $first: "$locationStack.timestamp" }
                                    }
                                }
                            ])
                            if(memberLastLoc[0] !== undefined)
                                memLocRes.push(memberLastLoc[0])
                            
                        } else {
                            const memberLastLoc = {
                                _id: member._id,
                                latitude: '0',
                                longitude: '0',
                                timestamp: Math.round((new Date()).getTime() /1000)
                            }
                            memLocRes.push(memberLastLoc)
                        }
                        
                    } catch (error) {
                        throw error
                    } finally {
                        count += 1
                        if (count === circle.members.length)
                            resolve()
                    }
                    
                })
            })
            res.send(memLocRes)
            
        } catch (error) {
            next(error)
        }
    },

    leaveCircle: async (req, res, next) => {
        try {
            const userId = req.payload.aud

            //getting user document
            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.NotFound('User Not Found!')

            //check if user has not a circle
            if (user.circle === na) throw createError.BadRequest()
            
            //download the circle
            const circle = await Circle.findOne({ circle_code: user.circle })
            
            if (!circle) throw createError.BadRequest()

            //if request is came from admin
            if (user.isAdmin) {
                //check if the user admin is the only one in the circle
                if (circle.members.length > 1) throw createError.BadRequest("you can't leave the circle while you are an admin")
                else {
                    //the admin is the only one then delete the entire circle
                    await Circle.findOneAndDelete({ _id: circle._id })
                    await User.findOneAndUpdate({ _id: user._id }, { circle: na, isAdmin: false })
                }
            }
            else {
                //user is not the circle admin -> delete the only user from the circle memers
                let newCircleMembers = []
                circle.members.forEach(member => {
                    var result = new Object()
                    result.userId = member._id
                    if (result.userId.equals(user._id)) return
                    newCircleMembers.push(member)
                })

                await Circle.findOneAndUpdate({ _id: circle._id }, { members: newCircleMembers })
                await User.findOneAndUpdate({ _id: user._id }, { circle: na, isAdmin: false })
            }
            res.send({
                isSuccessfull: true,
                message:'you leaved the circle successfully'
            })

        } catch (error) {
            next(error)
        }
    },

    changeCircleAdmin: async (req, res, next) => {
        try {
            const oldAdminId = req.payload.aud

            const newAdminId = req.params.targetUserId
            if(!newAdminId) createError.BadRequest()

            const oldAdminDoc = await User.findOne({ _id: oldAdminId })
            if (!oldAdminDoc) throw createError.NotFound()
            const newAdminDoc = await User.findOne({ _id: newAdminId })
            if (!newAdminDoc) throw createError.NotFound()
            
            if (oldAdminDoc.circle !== newAdminDoc.circle) throw createError.Unauthorized()
            
         
            const oldAdminObj = {
                _id: oldAdminDoc._id,
                email: oldAdminDoc.email,
                name: oldAdminDoc.name,
                circle: oldAdminDoc.circle,
                isAdmin: false,
                isSharing: oldAdminDoc.isSharing,
                photoUrl: oldAdminDoc.photoUrl,
                messageToken: oldAdminDoc.messageToken
            }
            const newAdminObj = {
                _id: newAdminDoc._id,
                email: newAdminDoc.email,
                name: newAdminDoc.name,
                circle: newAdminDoc.circle,
                isAdmin: true,
                isSharing: newAdminDoc.isSharing,
                photoUrl: newAdminDoc.photoUrl,
                messageToken: newAdminDoc.messageToken
            }

            let membersArray = []
            membersArray.push(oldAdminObj)
            membersArray.push(newAdminObj)


            const circle = await Circle.findOne({ circle_code: oldAdminDoc.circle })
            circle.members.forEach(member => {
                var result = new Object()
                result.userId = member._id
                if (result.userId.equals(oldAdminDoc._id)) return
                if (result.userId.equals(newAdminDoc._id)) return
                membersArray.push(member)
            })

            await Circle.findOneAndUpdate({_id: circle._id}, { members: membersArray })

            await User.findByIdAndUpdate(newAdminId, { isAdmin: true })
            await User.findByIdAndUpdate(oldAdminId, { isAdmin: false })
            await Circle.findOneAndUpdate({ circle_code: oldAdminDoc.circle }, { admin_id: newAdminId })

            res.send({
                isSuccessfull: true,
                message: 'Circle Admin successfully updated'
            })
        } catch (error) {
            next(error)
        }
    },

    deleteCircleMember: async (req, res, next) => {
        try {
            const targetMemberId = req.params.targetMemberId
            if (!targetMemberId) throw createError.BadRequest()
            const adminId = req.payload.aud

            if(adminId === targetMemberId) throw createError.BadRequest()

            const targetMemberDoc = await User.findOne({ _id: targetMemberId })
            if (!targetMemberDoc) throw createError.BadRequest()
            
            const adminDoc = await User.findOne({ _id: adminId })
            if (!adminDoc) throw createError.BadRequest()
            
            //check if they are not on same circle
            if (adminDoc.circle !== targetMemberDoc.circle) throw createError.BadRequest()
            
            await User.findOneAndUpdate({ _id: targetMemberId }, { circle: na })
            
            const circle = await Circle.findOne({ circle_code: adminDoc.circle })
            if (!circle) throw createError.NotFound()
            
            let newMembersArray = []
            circle.members.forEach(member => {
                var result = new Object()
                result.userId = member._id
                if (result.userId.equals(targetMemberDoc._id)) return
                newMembersArray.push(member)
            })
            console.log(newMembersArray);
            await Circle.findOneAndUpdate({ _id: circle._id }, { members: newMembersArray })
            
            res.send({
                isSuccessfull: true,
                message: 'user successfully removed!'
            })


        } catch (error) {
            next(error)
        }
    },

    changeCircleAccessibility: async (req, res, next) => {
        try {
            const userId = req.payload.aud

            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.BadRequest()
            
            if (user.circle === na) throw createError.BadRequest()
            
            const {accessFlag} = req.body
            if (!accessFlag) throw createError.BadRequest()
            
            if(accessFlag === 'true')
                await Circle.findOneAndUpdate({ circle_code: user.circle }, { accessibility: true })
            else
                await Circle.findOneAndUpdate({ circle_code: user.circle }, { accessibility: false })
            res.send({
                isSuccessfull: true,
                message: 'circle settings successfully updated'
            })

        } catch (error) {
            next(error)
        }
    },

}