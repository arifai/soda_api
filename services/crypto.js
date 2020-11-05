import bcrypt from 'bcrypt'
import crypto from 'crypto'
import ms from 'ms'
// import { v4 as uuidv4 } from 'uuid'

const salt = bcrypt.genSaltSync(15)
const key = crypto.randomBytes(32)
// const text = uuidv4()
const iv = crypto.randomBytes(16)

class Crypto {

    /**
     * Digunakan untuk hash password
     * @param {string} password 
     */
    static passHash(password) {
        const genHash = bcrypt.hashSync(password, salt)

        return genHash
    }

    /**
     * Digunakan untuk verifikasi password, apakah password
     * yang dimasukkan sama dengan hash yang dihasilkan dari
     * method `passHash()`
     * @param {string} password 
     * @param {string} hash 
     */
    static passMatch(password, hash) {
        const verify = bcrypt.compareSync(password, hash)

        return verify
    }

    /**
     * Digunakan untuk men-generasi token dengan menggunakan algoritma AES-256-CBC
     */
    static encrypt(text) {
        const chiper = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv)
        let encrypted = chiper.update(text)
        encrypted = Buffer.concat([encrypted, chiper.final()])

        return encrypted.toString('hex')
    }

    /**
     * Digunakan untuk decrypt dari token
     * @param {*} text 
     */
    static decrypt(text) {
        const iv = Buffer.from(text.iv, 'hex')
        const encryptedText = Buffer.from(text.encryptedData, 'hex')
        const dechiper = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv)
        let decrypted = dechiper.update(encryptedText)
        decrypted = Buffer.concat([decrypted, dechiper.final()])

        return decrypted.toString()
    }

    /**
     * Expired time
     */
    static expires() {
        return Math.floor(Date.now() + ms('1h'))
    }
}

export default Crypto;