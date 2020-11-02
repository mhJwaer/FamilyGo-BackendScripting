const Message = require('../Models/Message.model')
const User = require('../Models/User.model')
const Circle = require('../Models/Circle.model')


module.exports = (io) => {
    io.on('connection', socket => {
        console.log('new Client connected!! ', socket.id);

        let userDoc = null
        socket.on('JoinRoom', async (userId) => {
            console.log('joining room event!!');
            userDoc = await User.findById(userId)
            if (userDoc === null || userDoc.circle === 'N/A') return
            socket.join(userDoc.circle)
            
        })

        socket.on('retrieveCircleMembers', async (circleCode) => {
            const circle = await Circle.findOne({circle_code: circleCode})
            socket.emit("circleMembers", circle.members)
        })

        socket.on('retrieveOldMessages', async (circleCode) => {
            //return old messages 
            //TODO:: get last messages using paging
            const oldMessages = await Message.find({ circle: circleCode })
            if (oldMessages)
                socket.emit("oldMessages", oldMessages)
        })

        socket.on('sendMsg', async (msg) => {  
            console.log(msg.content);
            if (!msg) return
            //save message to db
            const message = new Message(msg)
            await message.save()
            socket.broadcast.to(userDoc.circle).emit('message', msg)
            // io.to(userDoc.circle).emit('message', msg)
        })

        socket.on('disconnect', () => {
            userDoc = null
            console.log('client disconnected');
        })
    })
}