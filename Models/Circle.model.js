const mongoose = require('mongoose')
const Schema = mongoose.Schema


const circleSchema = new Schema({
    circle_code: String,
    accessibility: Boolean,
    admin_id: String,
    members: Array,
    messages: Array
})

const Circle = mongoose.model('circle', circleSchema)

module.exports = Circle