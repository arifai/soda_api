import { UNAUTHORIZED } from 'http-status'
import jwt from 'jsonwebtoken'
import ApiResponse from '../helpers/api_response'

// Fungsi ini digunakan sebagai middleware untuk pembatasan
// apakah client sudah menggunakan token atau belum dan
// melakukan pengecekan apakah token yang dimasukkan valid atau tidak
export function auth(req, res, next) {
    const token = req.header('X-Access-Token')

    if (!token) {
        return ApiResponse.result(res, 'Failed', 'No token provided', null, UNAUTHORIZED)
    }

    const { PRIVATE_KEY } = process.env
    jwt.verify(token, PRIVATE_KEY, function (err, decode) {
        if (err) {
            return ApiResponse.result(res, 'Failed', 'Invalid token', null, UNAUTHORIZED)
        }

        req.token_id = decode.id
        next()
    })
}