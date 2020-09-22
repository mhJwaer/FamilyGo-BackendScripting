const express = require('express');
const morgan = require('morgan');
const createError = require('http-errors');
require('dotenv').config();
require('./helpers/init_mongodb')
const {
    verifyAccessToken
} = require('./helpers/jwt_helper')
require('./helpers/init_redis')

const app = express();
app.use(morgan('dev'))
app.use(express.json())
const PORT = process.env.PORT || 3000
const authRoute = require('./Routes/Auth.route')


app.use('/auth', authRoute)
app.get('/', verifyAccessToken, (req, res) => {
    // res.send('helllo from express :)')
    res.send(req.payload)
    // res.send(req.headers['authorization'])
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





app.listen(PORT, () => {
    console.log('server is running on port 3000');
});