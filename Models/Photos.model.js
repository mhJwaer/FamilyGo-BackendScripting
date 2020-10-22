const mongoose = require('mongoose')
const { schema } = require('./User.model')
const Schema = mongoose.Schema

const PhotoSchema = new Schema({
    _id: Schema.Types.ObjectId,
    photo: Buffer
})

const Photo = mongoose.model('photo', PhotoSchema)

module.exports = Photo