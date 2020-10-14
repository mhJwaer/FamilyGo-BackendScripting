const createError = require('http-errors')
const AuthUser = require('../Models/Auth.User.Model')
const User = require('../Models/User.model')
const na = "N/A"
const {
    response
} = require('express')
const {
    authSchema
} = require('../helpers/validation_schema')
const {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} = require('../helpers/jwt_helper')

// const client = require('../helpers/init_redis')


module.exports = {
    register: async (req, res, next) => {

        try {
            const result = await authSchema.validateAsync(req.body)
            const doesExist = await AuthUser.findOne({
                email: result.email
            })
            if (doesExist) throw createError.Conflict(`${result.email} is already been registered`)

            const authUser = new AuthUser(result)
            


            const savedAuthUser = await authUser.save();

            const user = new User({
                _id: savedAuthUser.id,
                circle: na,
                name: na,
                email: savedAuthUser.email,
                messageToken: na,
                photoUrl: na,
                isAdmin: false,
                isSharing: false
            })
            const savedUser = await user.save();
            console.log(`savedUser = ${savedUser}`);
            

            const accessToken = await signAccessToken(savedAuthUser.id)
            const refreshToken = await signRefreshToken(savedAuthUser.id)


            return res.send({
                accessToken,
                refreshToken
            })

        } catch (error) {
            if (error.isJoi === true) error.status = 422
            next(error)
        }


    },

    login: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body)
            const user = await AuthUser.findOne({
                email: result.email
            })

            if (!user) throw createError.NotFound('User not Registered!')

            const isMatch = await user.isValidPassword(result.password)
            if (!isMatch) throw createError.Unauthorized('Email/Password is not valid!')

            const accessToken = await signAccessToken(user.id)
            const refreshToken = await signRefreshToken(user.id)


            return res.send({
                accessToken,
                refreshToken
            })
        } catch (error) {
            if (error.isJoi === true) return next(createError.BadRequest('Invalid Email or Password!'))
            next(error)
        }
    },

    refreshToken: async (req, res, next) => {
        try {
            const {
                refreshToken
            } = req.body
            if (!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            const accessToken = await signAccessToken(userId)
            const refToken = await signRefreshToken(userId)

            res.send({
                accessToken: accessToken,
                refreshToken: refToken
            })
        } catch (error) {
            next(error)
        }
    },

    logout: async (req, res, next) => {
        try {
            const {
                refreshToken
            } = req.body
            if (!refreshToken) throw createError.BadRequest()
            const userId = await verifyRefreshToken(refreshToken)
            // client.DEL(userId, (err, val) => {
            //     if (err) {
            //         console.log(err.message)
            //         throw createError.InternalServerError()
            //     }
            //     console.log(val)
            //     res.sendStatus(204)
            // })
            return res.sendStatus(204)

        } catch (error) {
            next(error)
        }
    }

}