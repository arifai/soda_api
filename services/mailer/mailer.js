import nodemailer from 'nodemailer'
import Handlebars from 'handlebars'
import path from 'path'
import fs from 'fs'
require('dotenv').config()

const { SMPT_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

const transporter = nodemailer.createTransport({
    host: SMPT_HOST,
    port: SMTP_PORT,
    secure: true,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    }
})

/**
 * Method for send email
 * @param {*} payload 
 * @param {*} subject 
 * @param {*} templateName 
 */
export function sendEmail(payload, to, subject, templateName) {
    const template = fs.readFileSync(path.join(__dirname, 'templates', `${templateName}.hbs`), 'utf-8')
    const html = new Handlebars.compile(template)
    const mail = {
        from: `SMARAK <${SMTP_USER}>`,
        to: to,
        subject: subject,
        html: html(payload)
    }

    try {
        return transporter.sendMail(mail)
    } catch (error) {
        console.error(error);
    }
}