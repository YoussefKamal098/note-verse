import * as Yup from 'yup';

const FieldTypes = Object.freeze({
    STRING: 'string',
    INTEGER: 'integer',
    FLOAT: 'float',
    BOOLEAN: 'boolean',
});

const requiredField = (fieldName, fieldType) => {
    const requiredMessage = `${fieldName} is required`;

    // Validate the fieldType
    if (!Object.values(FieldTypes).includes(fieldType)) {
        throw new Error(`Invalid field type: '${fieldType}'. Valid types are: ${Object.values(FieldTypes).join(', ')}`);
    }

    switch (fieldType) {
        case FieldTypes.STRING:
            return Yup.string().required(requiredMessage);

        case FieldTypes.INTEGER:
            return Yup.number()
                .typeError(`${fieldName} must be a valid number`)
                .required(requiredMessage)
                .integer(`${fieldName} must be an integer`);

        case FieldTypes.FLOAT:
            return Yup.number()
                .typeError(`${fieldName} must be a valid float number`)
                .required(requiredMessage)
                .test(
                    'is-decimal',
                    `${fieldName} must be a valid float`,
                    (value) => value === undefined || /^\d+\.\d+$/.test(value.toString()),
                );

        case FieldTypes.BOOLEAN:
            return Yup.boolean().required(requiredMessage);

        default:
            return Yup.mixed().required(requiredMessage); // Default case for any other field
    }
};

export {FieldTypes, requiredField};
