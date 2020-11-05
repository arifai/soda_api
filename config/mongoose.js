import mongoose from 'mongoose'
require('dotenv').config()

const { NODE_ENV, DB_URL, DB_URL_TEST } = process.env
const DB = NODE_ENV === 'test' ? DB_URL_TEST : DB_URL

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
})

mongoose.connection.on('error', function (error) {
    console.error(`Database connection error: ${error}`);
})

mongoose.connection.on('disconnected', function () {
    console.log('Database disconnected');
})

const onTerminate = function () {
    mongoose.connection.close(function () {
        console.log('Database connection close');
        process.exit(0)
    })
}

process.on('SIGINT', onTerminate).on('SIGTERM', onTerminate)

export function dbConnection(app) {
    mongoose.connection.on('connected', function () {
        // console.log('Database connected');
        app
    })
}