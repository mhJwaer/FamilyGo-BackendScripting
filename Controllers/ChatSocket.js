const Message = require('../Models/Message.model')
const User = require('../Models/User.model')

module.exports = (io) => {
    io.on('connection', socket => {
        let oldMessages = []
        let userDoc = null
        socket.on('JoinRoom',async (userId) => {
            userDoc = await User.findById(userId)
            if (userDoc === null || userDoc.circle === 'N/A') return

            //return old messages 
            //TODO:: get last messages using paging
            oldMessages = await Message.find({ circle: userDoc.circle })
            if(oldMessages)
                socket.emit(oldMessages)
            socket.join(userDoc.circle)
        })

        socket.on('sendMsg', async (msg) => {  

            if (!msg) return
            //save message to db
            const message = new Message(msg)
            await message.save()
            io.to(userDoc.circle).broadcast('message', msg)
        })

        socket.on('disconnect', () => {
            console.log('client disconnected');
        })
    })
}