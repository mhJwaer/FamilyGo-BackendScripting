
const User = require('../Models/User.model')
const Circle = require('../Models/Circle.model')
const createError = require('http-errors')

module.exports = {
    adminRole: async (req, res, next) => {
        try {
            const oldAdminId = req.payload.aud
            const oldAdminDoc = await User.findOne({ _id: oldAdminId })
            if (!oldAdminDoc) throw createError.Unauthorized()
            if (!oldAdminDoc.isAdmin) {
                throw createError.Unauthorized()
            }
            
            const circleDoc = await Circle.findOne({ circle_code: oldAdminDoc.circle })
            if (!circleDoc) throw createError.Unauthorized()            
            if (oldAdminId !== circleDoc.admin_id) throw createError.Unauthorized()
            
            next()
        } catch (error) {
            next(error)
        }
    }
}