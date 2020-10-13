import debug from 'debug'
import morgan from 'morgan'
import express from 'express'
import { json, urlencoded } from 'body-parser'
import { NOT_FOUND } from 'http-status'
const { dbconn } = require('./config/mongoose')
import router from './routes/index'
const { apiResp } = require('./helpers/api_response')

require('dotenv').config()
const info = debug('info')
const app = express()
const { PORT } = process.env

// Database connection
dbconn()

app.use(morgan('combined', { stream: { write: msg => info(msg) } }))
app.use(json())
app.use(urlencoded({ extended: false }))
app.use('/api', router)

app.all('*', function (req, res) {
    return apiResp(res, 'failed', 'Not found', null, NOT_FOUND)
})

app.listen(PORT, function () {
    console.log(`Server started on http://localhost:${PORT}`);
})

export default app;