import mongoose from 'mongoose'

const AccountRegister = mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phone_num: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, required: true },
    code: { type: Number, required: true },
    register_time: { type: Date, default: Date.now }
})

AccountRegister.index({ email: 1, phone_num: 1 })

AccountRegister.options.toJSON = {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}

module.exports = mongoose.model('AccountRegister', AccountRegister)