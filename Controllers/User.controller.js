const createError = require('http-errors')
const User = require('../Models/User.model')
const Circle = require('../Models/Circle.model')
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

}