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


const upload = require('../helpers/upload_helper')

//get singed in user data
router.get('/', verifyAccessToken, getUserDetails)

//update user name
router.post('/save-username/:userName', verifyAccessToken, updateUserName)

//set user profile picture
router.post('/avatar', verifyAccessToken, upload.single('profileImage'), updateAvatar)

//update messaging Token
router.post('/message-token', verifyAccessToken, updateMessageToken)

//update user location
router.post('/location', verifyAccessToken, setUserLocation)

module.exports = router