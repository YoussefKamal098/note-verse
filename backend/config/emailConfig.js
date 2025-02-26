const {parseString, parseNumber, parseBoolean} = require('shared-utils/env.utils');
const path = require('path');
require('dotenv').config();

const emailConfig = Object.freeze({
    host: parseString(process.env.EMAIL_HOST, 'smtp.gmail.com'),
    port: parseNumber(process.env.EMAIL_PORT, 465), // Default secure Gmail port
    secure: parseBoolean(process.env.EMAIL_SECURE, true),
    user: parseString(process.env.EMAIL_USER, ''),
    pass: parseString(process.env.EMAIL_PASS, ''),
    from: parseString(process.env.EMAIL_FROM, process.env.EMAIL_USER || ''),
    templatesDir: parseString(process.env.EMAIL_TEMPLATES_DIR, path.join(__dirname, '../templates/emails/'))
});

module.exports = emailConfig;
