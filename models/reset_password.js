import mongoose, { Schema } from 'mongoose'

const ResetPassword = mongoose.Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    token: { type: String, required: true },
    expires: { type: Date, required: true }
})

ResetPassword.index({ account_id: 1 })


ResetPassword.options.toJSON = {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}

module.exports = mongoose.model('ResetPassword', ResetPassword)