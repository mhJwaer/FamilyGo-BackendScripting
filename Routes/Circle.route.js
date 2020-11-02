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
    leaveCircle,
    changeCircleAdmin,
    deleteCircleMember,
    changeCircleAccessibility,
} = require('../Controllers/Circle.controller')
const { adminRole } = require('../helpers/auth_helper')


//create a new circle
router.get('/create', verifyAccessToken, createCircle)

//join an existing circle
router.post('/join/:circle_code', verifyAccessToken, joinCircle)

//retrieve circle members data
router.get('/members', verifyAccessToken, getCircleMembers)

//retrieve ciercle members location data
router.get('/members-locations', verifyAccessToken, getCircleMembersLocations)

//leave circle
router.patch('/leave', verifyAccessToken, leaveCircle)

//change circle admin
router.patch('/admin/:targetUserId', verifyAccessToken, adminRole, changeCircleAdmin )

//update circle accessbility settings
router.patch('/accessibility', verifyAccessToken, adminRole, changeCircleAccessibility)

//delete circle member
router.patch('/delete-member/:targetMemberId', verifyAccessToken, adminRole, deleteCircleMember)


module.exports = router