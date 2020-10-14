const mongoose = require('mongoose')
const Schema = mongoose.Schema



const UserSchema = new Schema({
    _id: Schema.Types.ObjectId,
    circle: String,
    name: String,
    email:{
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    messageToken: String,
    photoUrl: String,
    isAdmin: Boolean,
    isSharing: Boolean
})




const User = mongoose.model('user', UserSchema);

module.exports = User 