import mongoose, { Schema } from 'mongoose'

const AccountAddress = mongoose.Schema({
    account_id: { type: Schema.Types.ObjectId, ref: 'Account' },
    address: { type: Text, required: true },
    village: { type: String, required: true },
    sub_district: { type: String, required: true },
    district: { type: String, required: true },
    province: { type: String, required: true }
})

AccountAddress.index({ account_id: 1 })

AccountAddress.options.toJSON = {
    transform: function (_doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}

module.exports = mongoose.model('AccountAddress', AccountAddress) 