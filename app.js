const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const morgan = require('morgan');
const createError = require('http-errors')
const jwt = require('jsonwebtoken')
require('dotenv').config();
require('./helpers/init_mongodb')

const {
    verifyAccessToken
} = require('./helpers/jwt_helper')
// require('./helpers/init_redis')

const app = express();
const server = http.createServer(app)

//setup sockets
const io = socketio(server)
io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) return next(createError.Unauthorized())
            socket.decoded = decoded
            next()
        })
    }
    else {
        next(createError.Unauthorized())
    }
})
require('./Controllers/ChatSocket')(io)

app.use(morgan('dev'))
app.use(express.json())
const PORT = process.env.PORT || 3000
const authRoute = require('./Routes/Auth.route')
const circleRoute = require('./Routes/Circle.route')
const userRoute = require('./Routes/User.route')
const messageRoute = require('./Routes/Message.route')
// const bodyParser = require('body-parser')

// app.use(bodyParser)
app.use('/auth', authRoute)
app.use('/circle', circleRoute)
app.use('/user', userRoute)
app.use('/message', messageRoute)
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => {
    res.send('helllo from express :)')
})


// handle errors
app.use(('/'), async (req, res, next) => {
    next(createError.NotFound())
})

app.use(async (err, req, res, next) => {
    res.status(err.status || 500)
    res.send({
        error: {
            status: err.status || 500,
            message: err.message,
        }
    })
})



// module.exports = app
server.listen(PORT, () => {
    console.log('server is running on port 3000');
});