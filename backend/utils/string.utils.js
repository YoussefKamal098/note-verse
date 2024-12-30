const mongoose = require("mongoose");
const {Types} = require("mongoose");

const capitalizeFirstLetter = (fieldName="") => {
    if (typeof fieldName !== 'string' || fieldName.length === 0) {
        throw new Error(`${fieldName} is not a string`);
    }
    return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
};

function sanitizeString(str) {
    if (typeof str !== 'string') return '';

    return str.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&").trim();
}

function isValidObjectId(id="") {
    return mongoose.isValidObjectId(id);
}

function convertToObjectId(id="") {
    if (!mongoose.isValidObjectId(id))
        return null;

    return new Types.ObjectId(id);
}

module.exports = { capitalizeFirstLetter, sanitizeString, isValidObjectId, convertToObjectId };
