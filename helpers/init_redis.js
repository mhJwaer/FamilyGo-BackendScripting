// const redis = require('redis')

// const client = redis.createClient({
//     port: 6379,
//     host: "127.0.0.1"
// })

// client.on('connect', () => {
//     console.log('Redis Client is connected....')
// })

// client.on('ready', () => {
//     console.log("client connected to redis, and ready to use...");
// })

// client.on('error', (err) => {
//     if (err) console.log(err.message)
// })

// client.on('end', () => {
//     console.log('client is disconnected from redis...');
// })

// process.on('SIGINT', () => {
//     client.quit()
// })

// module.exports = client