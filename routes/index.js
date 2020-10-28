import { Router } from 'express'
const system = require('../controllers/system')
const account = require('../controllers/account')
const auth = require('../services/verif_token')
const router = Router()

// System
router.route('/system').get(system.gitInfo)

// Account auth
router.route('/account/auth/register').post(account.register)
router.route('/account/auth/activate').post(account.activate)
router.route('/account/auth/authorize').post(account.authorize)
router.route('/account/auth/unauthorize').post(auth.auth, account.unauthorize)

// Account routes
router.route('/account/me/info').get(auth.auth, account.me)
router.route('/account/me/update').post(auth.auth, account.update)

export default router