const express = require('express')
const router = express.Router()
const {
    verifyAccessToken
} = require('../helpers/jwt_helper')
const {
    createCircle,
    joinCircle,
    getCircleMembers,
    getCircleMembersLocations,
    changeCircleAdmin
} = require('../Controllers/Circle.controller')
const { adminRole } = require('../helpers/auth_helper')



router.get('/create', verifyAccessToken, createCircle)

router.post('/join/:circle_code', verifyAccessToken, joinCircle)

router.get('/members', verifyAccessToken, getCircleMembers)

router.get('/members-locations', verifyAccessToken, getCircleMembersLocations)

//change circle admin
router.patch('/admin/:targetUserId', verifyAccessToken, adminRole, changeCircleAdmin )
//leave circle

//update circle accessbility settings

//delete circle member


module.exports = router