import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, OK, UNAUTHORIZED } from 'http-status'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import ApiResponse from '../helpers/api_response'
import Crypto from '../services/crypto'
import Validator from '../helpers/validator'
const Account = require('../models/account/account')
const AccountRegister = require('../models/account/account_register')
const AccessToken = require('../models/account/access_token')
const ResetPassword = require('../models/reset_password')
const mailer = require('../services/mailer/mailer')

/**
 * @api {post} /account/auth/register Account register
 * @apiName Account Register
 * @apiGroup Account Auth
 * @apiDescription Mendaftarkan akun baru
 * 
 * @apiSuccess {String} full_name Nama lengkap akun
 * @apiSuccess {String} email Email yang nantinya digunakan untuk menerima kode verifikasi dan login/masuk
 * @apiSuccess {String} phone_num Nomor handphone/seluler akun
 * @apiSuccess {String} password Password digunakan untuk login/masuk
 * 
 * @apiSuccessExample Success-Response: 
 * {
 *   "status": "Success",
 *   "message": "",
 *   "result": {
 *       "email": "johndoe@mail.com",
 *       "token": "ea356de155219cab3e24080fa2551372a1c04f123ee5c3943c4818222be0c53950f4c8f56b39ff8024934454c65",
 *       "register_time": "2020-10-28T07:34:19.438Z"
 *   }
 * }
 */
export async function register(req, res) {
	try {
		// Validasi untuk register
		const { error } = Validator.register(req.body)

		if (error) {
			const msgErr = error.details[0].message

			return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
		}

		const { full_name, email, phone_num, password } = req.body
		const passHash = Crypto.passHash(password)
		const text = uuidv4()
		const token = Crypto.encrypt(text)
		// Membuat nomor acak sebanyak 6 dijit angka
		const code = Math.floor(100000 + Math.random() * 900000)

		const accountRegister = new AccountRegister({
			full_name: full_name,
			email: email,
			phone_num: phone_num,
			password: passHash,
			token: token,
			code: code
		})

		await accountRegister.save(function (err, result) {
			// Handle duplicate key
			if (err && err.code === 11000) {
				return ApiResponse.result(res, 'Failed', 'Account already exists', null, BAD_REQUEST)
			} else {
				mailer.sendEmail(result, result.email, 'Kode Konfirmasi Akun Anda', 'account_activate')

				return ApiResponse.result(res, 'Success', '', { email: result.email, token: result.token, register_time: result.register_time }, CREATED)
			}
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/**
 * @api {post} /account/auth/activate Account activate
 * @apiName Account Activate
 * @apiGroup Account Auth
 * @apiDescription Mengaktifkan akun yang telah melakukan pendaftaran sebelumnya. 
 * 
 * @apiSuccess {String} token Gunakan token yang didapatkan setelah pendaftaran
 * @apiSuccess {Number} code Gunakan kode unik enam angka yang dikirimkan melalui email
 */
export async function activate(req, res) {
	try {
		// Validasi untuk activasi
		const { error } = Validator.activate(req.body)

		if (error) {
			const msgErr = error.details[0].message

			return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
		}

		const { token, code } = req.body
		AccountRegister.findOne({ token: token, code: code }, function (err, result) {
			if (err) {
				console.error(err);
			} else if (!result) {
				return ApiResponse.result(res, 'Failed', 'Not valid', null, BAD_REQUEST)
			} else {
				const account = new Account({
					full_name: result.full_name,
					email: result.email,
					phone_num: result.phone_num,
					password: result.password,
					active: true
				})

				account.save(function (err) {
					if (err && err.code === 11000) {
						return ApiResponse.result(res, 'Failed', 'Account already exists', null, BAD_REQUEST)
					} else {
						return ApiResponse.result(res, 'Success', 'Account activated', null, OK)
					}
				})

				// Hapus collection setelah user berhasil aktivasi
				AccountRegister.findOneAndDelete({ token: token }, function (err) {
					if (err) {
						console.error(err);
					}
				})
			}
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/** 
 * @api {post} /account/auth/authorize Account authorize
 * @apiName Account Athorize
 * @apiGroup Account Auth
 * @apiDescription Untuk otorisasi akun
 * 
 * @apiSuccess {String} email Gunakan email yang telah terdaftar dan aktif
 * @apiSuccess {String} password Gunakan password/kata sandi yang telah didaftarkan
 * 
 * @apiSuccessExample Success-Response:
 * {
 *   "status": "Success",
 *   "message": "Token created",
 *   "result": {
 *       "account_id": "5f9856f4055dd20952e10ed7",
 *       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmOTg1NmY0MDU1ZGQyMDk1MmUxMGVkNyIsImlhdCI6MTYwMzg3MzA3OCw",
 *       "expires": "2020-10-28T09:17:58.970Z"
 *   }
 * }
*/
export async function authorize(req, res) {
	try {
		// Validasi untuk authorize
		const { error } = Validator.authorize(req.body)

		if (error) {
			const msgErr = error.details[0].message

			return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
		}

		// Cek apakah email ada di collection
		const { email, password } = req.body
		Account.findOne({ email: email }, function (err, account) {
			if (err) {
				console.error(err);
			} else if (!account) {
				return ApiResponse.result(res, 'Failed', 'Email not found', null, BAD_REQUEST)
			} else if (!account.active) {
				return ApiResponse.result(res, 'Failed', 'Account not yet active', null, UNAUTHORIZED)
			}

			const match = Crypto.passMatch(password, account.password)

			if (!match) {
				return ApiResponse.result(res, 'Failed', 'Invalid password', null, BAD_REQUEST)
			}

			// Cek terlebih dahulu apakah account_id ada di collection AccessToken
			// jika tidak ada buatkan token
			// jika ada update token lama ke token yang baru
			const { PRIVATE_KEY } = process.env
			AccessToken.findOne({ account_id: account.id }, function (err, accessToken) {
				if (err) {
					console.error(err);
				}

				// Membuat token baru dengan waktu kadaluarsa 1 jam
				const token = jwt.sign({ id: account.id }, PRIVATE_KEY, { expiresIn: '1h' })
				const expires = Crypto.expires()
				if (!accessToken) {
					const accessToken = new AccessToken({
						account_id: account.id,
						token: token,
						expires: expires
					})

					accessToken.save()

					return ApiResponse.result(res, 'Success', 'Token created',
						{ account_id: accessToken.account_id, token: accessToken.token, expires: accessToken.expires }, CREATED)
				} else {
					AccessToken.findOneAndUpdate({ account_id: account.id }, { token: token, expires: expires }, { new: true }, function (err, newToken) {
						if (err) {
							console.error(err)
						} else {
							return ApiResponse.result(res, 'Success', 'Token created',
								{ account_id: newToken.account_id, token: newToken.token, expires: newToken.expires }, CREATED)
						}
					})
				}
			})
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/** 
 * @api {get} /account/me/info Account info
 * @apiName Account Info
 * @apiGroup Account
 * @apiDescription Untuk mendapatkan info akun yang telah ter-otorisasi
 * 
 * @apiHeader {String} X-Access-Token Unique access token
*/
export async function me(req, res) {
	// Mencari akun berdasarkan token_id. token_id ini didapat di dalam file services/verif_token.js
	// Fungsinya adalah untuk mencari account.id yang sudah di sign menggunakan fungsi jwt.sign()
	// yang sudah diproses sebelumnya, lalu diverifikasi menggunakan jwt.verify()
	// untuk mengembalikan nilai account.id seperti semula
	try {
		Account.findById(req.token_id, { password: 0 }, function (err, account) {
			if (err) {
				console.error(err);
			} else if (!account) {
				return ApiResponse.result(res, 'Failed', 'Account not found', null, BAD_REQUEST)
			} else if (!account.active) {
				return ApiResponse.result(res, 'Failed', 'Account not yet active', null, BAD_REQUEST)
			} else {
				return ApiResponse.result(res, 'Success', '', account, OK)
			}
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/** 
 * @api {post} /account/me/update?id=ACCOUNT_UNIQUE_ID Account update
 * @apiName Account Update
 * @apiGroup Account
 * @apiDescription Untuk meng-ubah beberapa informasi akun
 * 
 * @apiParam {String} ACCOUNT_UNIQUE_ID Gunakan ID akun
 * 
 * @apiHeader {String} X-Access-Token Unique access token
*/
export async function update(req, res) {
	try {
		await Account.findByIdAndUpdate(req.query.id, req.body, function (err, result) {
			if (err) {
				console.error(err);
			}

			const { error } = Validator.update(req.body)

			if (error) {
				const msgErr = error.details[0].message

				return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
			} else if (!result) {
				return ApiResponse.result(res, 'Failed', 'Not valid', null, BAD_REQUEST)
			} else if (!result.active) {
				return ApiResponse.result(res, 'Failed', 'Account not yet active', null, UNAUTHORIZED)
			} else {
				return ApiResponse.result(res, 'Success', '', result, OK)
			}
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/** 
 * @api {post} /account/auth/unauthorize Account unauthorize
 * @apiName Account Unauthorize
 * @apiGroup Account Auth
 * @apiDescription Untuk logout atau keluar
 * 
 * @apiHeader {String} X-Access-Token Unique access token
*/
export async function unauthorize(req, res) {
	// Menghapus token dari collection. Mungkin token sebelumnya yang sudah dihapus
	// akan tetap valid, itu dikarenakan jwt menganggap token tersebut masih belum
	// expired atau kadaluarsa. Waktu expired 1 jam.
	await AccessToken.findOneAndDelete({ account_id: req.token_id }, function (err) {
		if (err) {
			console.error(err);
		} else {
			return ApiResponse.result(res, 'Success', 'Unauthorized', null, UNAUTHORIZED)
		}
	})
}

/**
 * @api {post} /account/auth/reset_password Reset account password
 * @apiName Reset Password
 * @apiGroup Account Auth
 * @apiDescription Untuk reset/atur ulang password
 * 
 * @apiSuccess {String} email Gunakan email akun yang telah terdaftar dan aktif
 */
export async function resetPassword(req, res) {
	try {
		await Account.findOne({ email: req.body.email }, function (err, result) {
			if (err) {
				console.error(err);
			}

			const { error } = Validator.resetPassword(req.body)

			if (error) {
				const msgErr = error.details[0].message

				return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
			}

			if (!result) {
				return ApiResponse.result(res, 'Failed', 'Account not found', null, BAD_REQUEST)
			}

			const text = uuidv4()
			const token = Crypto.encrypt(text)
			const resetPassword = new ResetPassword({
				account_id: result.id,
				token: token,
				expires: Crypto.expires()
			})

			resetPassword.save(function (err, result) {
				if (err) {
					console.error(err);
				} else {
					mailer.sendEmail(result, req.body.email, 'Permintaan Atur Ulang Kata Sandi', 'reset_password')

					return ApiResponse.result(res, 'Success', '', { account_id: result.account_id, token: result.token, expires: result.expires }, CREATED)
				}
			})
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}

/** 
 * @api {post} /account/auth/reset_password/confirm?token=TOKEN Confirm reset password
 * @apiName Confirm Reset Password
 * @apiGroup Account Auth
 * @apiDescription Untuk konfirmasi reset password dengan link yang telah dikirim ke email
 * 
 * @apiParam {String} TOKEN Gunakan token yang sudah dikirim ke email
 * @apiSuccess {String} password Buatlah password yang baru
*/
export async function confirmPassword(req, res) {
	try {
		await ResetPassword.findOne({ token: req.query.token }, function (err, result) {
			const { error } = Validator.confirmResetPassword(req.body)

			if (error) {
				const msgErr = error.details[0].message

				return ApiResponse.result(res, 'Failed', msgErr, null, BAD_REQUEST)
			}

			if (err) {
				console.error(err);
			} else if (!result) {
				return ApiResponse.result(res, 'Failed', 'Not valid', null, BAD_REQUEST)
			} else {
				const passHash = Crypto.passHash(req.body.password)
				Account.findByIdAndUpdate(result.account_id, { password: passHash }, function (err, resUpdate) {
					console.log(resUpdate.id);
					if (err) {
						console.error(err);
					} else if (!resUpdate.active) {
						return ApiResponse.result(res, 'Failed', 'Account not yet active', null, UNAUTHORIZED)
					} else {
						ResetPassword.findOneAndDelete({ account_id: resUpdate.id }, function (error) {
							if (error) {
								console.error(error);
							}
						})

						return ApiResponse.result(res, 'Success', 'Password updated', null, OK)
					}
				})
			}
		})
	} catch (error) {
		console.error(error.message);
		return ApiResponse.result(res, 'Failed', 'Internal server error', error.message, INTERNAL_SERVER_ERROR)
	}
}