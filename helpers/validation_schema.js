const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required()
})

const saveUserNameSchema = Joi.object({
    userName: Joi.string().alphanum().min(3)
})

module.exports = {
    authSchema,
    saveUserNameSchema,
}