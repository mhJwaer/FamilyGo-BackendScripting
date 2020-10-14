const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017' || process.env.MONGODB_URI, {
        dbName: "Family-Go-DB",
        useUnifiedTopology: true,
        useNewUrlParser: true
    })
    .then(() => {
        console.log('mongodb is connected...')
    })
    .catch(err => {
        console.log(err.message);
    })


mongoose.connection.on('connected', () => {
    console.log('mongodb connected');
})


mongoose.connection.on('error', (err) => {
    console.log(err.message);
})


mongoose.connection.on('disconnected', () => {
    console.log('mongodb is disconnected');
})


process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0)
})