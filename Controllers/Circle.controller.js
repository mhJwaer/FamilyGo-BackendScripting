const {
    randCircleCode
} = require('../helpers/helper_functions')
const User = require('../Models/User.model')
const createError = require('http-errors')
const Circle = require('../Models/Circle.model')
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
                _id: userDoc.id,
                email: userDoc.email,
                name: userDoc.name,
                circle: code,
                isAdmin: true,
                isSharing: userDoc.isSharing,
                photoUrl: userDoc.photoUrl,
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
                _id: user.id,
                email: user.email,
                name: user.name,
                circle: code,
                isAdmin: false,
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
    }

}