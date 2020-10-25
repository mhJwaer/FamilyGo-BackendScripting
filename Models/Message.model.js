const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ChatSchema = new Schema({
    createdAt: String,
    content: String,
    senderId: Schema.Types.ObjectId,
    circle: String
})


const Chat = mongoose.model('chatMessages', ChatSchema)

module.exports = Chat