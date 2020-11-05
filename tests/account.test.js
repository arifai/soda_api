import chai from 'chai'
import chaiHttp from 'chai-http'
import AccountRegister from '../models/account/account_register'
import AccessToken from '../models/account/access_token'
import Account from '../models/account/account'
import app from '../server'
import { account_auth } from './api_endpoint'

chai.use(chaiHttp)
const should = chai.should()

describe('Account auth', function () {
    const payload = {
        full_name: 'John Doe',
        email: 'johndoe@mail.com',
        phone_num: '08123456780',
        password: 'johndoe2020'
    }

    const auth = {
        email: 'usertest@mail.com',
        password: '12345678'
    }

    describe(`POST ${account_auth.register}`, function () {
        it('has return 201 CREATED', function () {
            chai.request(app).post(account_auth.register).send(payload)
                .end(function (err, res) {
                    should.exist(res.body)
                    res.should.have.status(201)
                })
        })

        it('has return 400 BAD_REQUEST', function () {
            chai.request(app).post(account_auth.register).send({ email: payload.email })
                .end(function (err, res) {
                    should.exist(res.body)
                    res.should.have.status(400)
                })
        })
    })

    describe(`POST ${account_auth.activate_account}`, function () {
        it('has return 200 OK', function () {
            chai.request(app).post(account_auth.activate_account).send({
                token: '7262c0ba93b35748bec98eeff5836ec422e64b175949e6f6f26027654ff12cf722a24fd68bb646ea51735f6704f114aa',
                code: 123456
            }).end(function (err, res) {
                should.exist(res.body)
                res.should.have.status(200)
            })
        })

        it('has return 400 BAD_REQUEST', function () {
            chai.request(app).post(account_auth.activate_account).send({
                token: '7262c0ba93b35748bec98eeff5836ec422e64b175949e6f6f26027654ff12cf722a24fd68bb646ea51735f6704f114aa',
                code: 112233
            }).end(function (err, res) {
                should.exist(res.body)
                res.should.have.status(400)
            })
        })
    })

    describe(`POST ${account_auth.authorize}`, function () {
        it('has return 201 CREATED', function () {
            chai.request(app).post(account_auth.authorize).send(auth)
                .end(function (err, res) {
                    should.exist(res.body)
                    res.should.have.status(201)
                })
        })

        it('has return 400 BAD_REQUEST cause password isnt used', function () {
            chai.request(app).post(account_auth.authorize).send({ email: auth.email })
                .end(function (err, res) {
                    should.exist(res.body)
                    res.should.have.status(400)
                })
        })

        it('has return 400 BAD_REQUEST cause account not found', function () {
            chai.request(app).post(account_auth.authorize).send({
                email: payload.email,
                password: payload.password
            }).end(function (err, res) {
                should.exist(res.body)
                res.should.have.status(400)
            })
        })
    })
})

afterEach(function (done) {
    AccountRegister.deleteMany({})
    AccessToken.deleteMany({})
    Account.deleteMany({})

    done()
})