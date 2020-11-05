import Joi from 'joi';

class Validator {

    /**
     * Register validation
     * @param {*} data 
     */
    static register(data) {
        const schema = Joi.object().keys({
            full_name: Joi.string().min(3).max(50).required().trim(),
            email: Joi.string().lowercase().required().email({ minDomainSegments: 2, tlds: { allow: true } }).trim(),
            phone_num: Joi.string().lowercase().min(11).max(13).required().pattern(/^[0-9]+$/).message('phone_num must be a number').trim(),
            password: Joi.string().min(8).max(50).required()
        })

        return schema.validate(data)
    }

    /**
     * Authorize validation
     * @param {*} data 
     */
    static authorize(data) {
        const schema = Joi.object().keys({
            email: Joi.string().lowercase().required().email({ minDomainSegments: 2, tlds: { allow: true } }).trim(),
            password: Joi.string().min(8).max(50).required()
        })

        return schema.validate(data)
    }

    /**
     * Activate validation
     * @param {*} data 
     */
    static activate(data) {
        const schema = Joi.object().keys({
            token: Joi.string().required().trim(),
            code: Joi.number().required()
        })

        return schema.validate(data)
    }

    /**
     * Update account
     * @param {*} data 
     */
    static update(data) {
        const schema = Joi.object().keys({
            full_name: Joi.string().min(3).max(50).trim(),
            email: Joi.string().lowercase().email({ minDomainSegments: 2, tlds: { allow: true } }).trim(),
            phone_num: Joi.string().lowercase().min(11).max(13).pattern(/^[0-9]+$/).message('phone_num must be a number').trim(),
        })

        return schema.validate(data)
    }

    static resetPassword(data) {
        const schema = Joi.object().keys({
            email: Joi.string().lowercase().required().email({ minDomainSegments: 2, tlds: { allow: true } }).trim(),
        })

        return schema.validate(data)
    }

    static confirmResetPassword(data) {
        const schema = Joi.object().keys({
            password: Joi.string().min(8).max(50).required()
        })

        return schema.validate(data)
    }
}

export default Validator;