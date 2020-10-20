const express = require('express')
const router = express.Router()
const {
    updateUserName,
    updateAvatar,
    getUserDetails,
    updateMessageToken,
    setUserLocation
} = require('../Controllers/User.controller')

const {
    verifyAccessToken
} = require('../helpers/jwt_helper')

router.get('/', verifyAccessToken, getUserDetails)

router.post('/save-username/:userName', verifyAccessToken, updateUserName)

router.post('/avatar', verifyAccessToken, updateAvatar)

router.post('/message-token', verifyAccessToken, updateMessageToken)

router.post('/location', verifyAccessToken, setUserLocation)

module.exports = router