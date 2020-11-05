import debug from 'debug'
import morgan from 'morgan'
import express from 'express'
import { json, urlencoded } from 'body-parser'
import { NOT_FOUND } from 'http-status'
const { dbConnection } = require('./config/mongoose')
import router from './routes/index'
import ApiResponse from './helpers/api_response'

require('dotenv').config()
const info = debug('info')
const app = express()
const { BASE_URL, PORT } = process.env

app.use(morgan('combined', { stream: { write: msg => info(msg) } }))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use('/api', router)
app.use('/api-docs', express.static('./docs'))

// Jika endpoint salah akan mengarahkan ke ApiResponse NOT_FOUND
app.all('*', function (req, res) {
    ApiResponse.result(res, 'Failed', 'Not found', null, NOT_FOUND)
})

dbConnection(app.listen(PORT, function (err) {
    if (err) {
        console.error(`Server connection error: ${err}`);
    } else {
        console.log(`Server started on ${BASE_URL}:${PORT}`);
    }
}))

export default app;