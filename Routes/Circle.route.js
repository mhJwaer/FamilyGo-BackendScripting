const express = require('express')
const router = express.Router()
const {
    verifyAccessToken
} = require('../helpers/jwt_helper')
const {
    createCircle,
    joinCircle
} = require('../Controllers/Circle.controller')



router.get('/create', verifyAccessToken, createCircle)

router.post('/join/:circle_code', verifyAccessToken, joinCircle)


module.exports = router