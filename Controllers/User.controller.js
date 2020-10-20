const createError = require('http-errors')
const User = require('../Models/User.model')
const Circle = require('../Models/Circle.model')
const UserLocation = require('../Models/UserLocation.model')
const { findByIdAndUpdate } = require('../Models/User.model')
const na = 'N/A'
// const {
//     saveUserNameSchema
// } = require('../helpers/validation_schema')


module.exports = {

    getUserDetails: async (req, res, next) => {
      try {
          const userId = req.payload.aud

          const user = await User.findOne({ _id: userId })
          if (!user) throw createError.NotFound('User Not Found!')
          res.send(user)
      } catch (error) {
          next(error)
      }  
    },

    updateUserName: async(req, res, next) =>{
        try {
            const userId = req.payload.aud
            const {userName} = req.params
            // const userName = await saveUserNameSchema.validateAsync({userName: userName})
    
            //check if user does not exist
            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.NotFound('User Not Found!')

            //check if user has a circle -> if true update user name in members array in the circle
            if (user.circle !== na) {
                //query the circle
                let newArrayMembers  = []
                const circle = await Circle.findOne({ circle_code: user.circle })
                if (circle) {
                    circle.members.forEach(member => {
                        if (member._id != userId)
                            newArrayMembers.push(member)
                    })
                    const userObj = {
                        _id: user.id,
                        email: user.email,
                        name: userName,
                        circle: user.circle,
                        isAdmin: user.isAdmin,
                        isSharing: user.isSharing,
                        photoUrl: user.photoUrl,
                    }
                    newArrayMembers.push(userObj)
                    await Circle.findOneAndUpdate({_id: circle.id}, {members: newArrayMembers})
                }
            }
    
            //find user by id and update the user name
            await User.findByIdAndUpdate(userId, { name: userName }, (err, doc) => {
                if (err) {
                    console.log('Error: ',err.message)
                    throw createError.InternalServerError()
                }
                res.send({
                    isSuccessfull: true,
                    message: "user name updated successfully"
                })    
            })
        } catch (error) {
            // if (error.isJoi === true) return next(createError.BadRequest('Invalid User name!'))
            next(error)
        }
    },

    updateAvatar: async (req, res, next) => {  
    },

    updateMessageToken: async (req, res, next) => {
        try {
            const userId = req.payload.aud
            const messageToken = req.body.messageToken
            if (!messageToken) throw createError.BadRequest('No messaging Token!')
        
            const user = await User.findOne({ _id: userId })
            if (!user) throw createError.NotFound()
        

            if (user.circle !== na) {
                let newCircleMembers = []
                const userCircle = await Circle.findOne({ circle_code: user.circle })
                if (userCircle) {
                    userCircle.members.forEach(member => {
                        if (member._id !== userId)
                            newCircleMembers.push(member)
                    })

                    const userObj = {
                        _id: user.id,
                        email: user.email,
                        name: user.name,
                        circle: user.circle,
                        isAdmin: user.isAdmin,
                        isSharing: user.isSharing,
                        photoUrl: user.photoUrl,
                        messageToken: messageToken
                    }
                    newCircleMembers.push(userObj)
                    await Circle.findByIdAndUpdate(userCircle.id, {members: newCircleMembers})

                }
            }

            await User.findByIdAndUpdate(userId, { messageToken: messageToken })
            res.send({
                isSharing: true,
                message: 'Token Updated Successfully'
            })
        } catch (error) {
            next(error)
        }
    },

    setUserLocation: async (req, res, next) => {
        try {
            const userId = req.payload.aud
            const { latitude, longitude } = req.body
            if(!latitude || !longitude) throw createError.BadRequest('Bad or Incompleted Entity')
            var ts = Math.round((new Date()).getTime() / 1000)

            const location = {
                latitude: latitude,
                longitude: longitude,
                timestamp: ts
            }

            await UserLocation.update({ _id: userId }, { $push: { locationStack: location } })
            
            res.send({
                isSuccessfull: true,
                message: 'Location updated Successfully'
            })

        } catch (error) {
            next(error)
        }
    }

}