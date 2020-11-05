import mongoose, { Schema } from 'mongoose'

const AccessToken = mongoose.Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    token: { type: String, required: true },
    expires: { type: Date, required: true }
})

AccessToken.index({ account_id: 1 })

AccessToken.options.toJSON = {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}

module.exports = mongoose.model('AccessToken', AccessToken)