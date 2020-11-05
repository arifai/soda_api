import mongoose from 'mongoose'

const Account = mongoose.Schema({
    full_name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, unique: true },
    phone_num: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    active: { type: Boolean, required: true, default: false },
    register_time: { type: Date, default: Date.now }
})

Account.index({ email: 1, phone_num: 1 })

Account.options.toJSON = {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}

module.exports = mongoose.model('Account', Account)