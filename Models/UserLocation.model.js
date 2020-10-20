const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserLocationSchema = new Schema({
    _id: Schema.Types.ObjectId,
    locationStack: {
        latitude: String,
        longitude: String,
        timestamp: String
    },
})

const UserLocation = mongoose.model('user-location', UserLocationSchema)

module.exports = UserLocation