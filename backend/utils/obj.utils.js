/**
 * Recursively freezes an object, making it immutable by preventing further modifications to its properties.
 *
 * - Handles circular references by tracking visited objects.
 * - Skip freezing for specific types: `ArrayBuffer`, TypedArrays, `Date`, and `ObjectId`.
 *
 * @param {Object|Array} object - The object or array to freeze.
 * Must be non-null and of type object.
 * @param {Set<Object>} [visited=new Set()] - A set of objects already visited to avoid circular references.
 * @returns {Object|Array} - The original object, now deeply frozen.
 *
 * @example
 * const obj = { a: 1, b: { c: 2 } };
 * deepFreeze(obj);
 * obj.b.c = 3; // Throws an error in strict mode because the object is frozen.
 *
 * @example
 * const circular = {};
 * circular.Self = circular;
 * deepFreeze(circular); // Handles circular references without throwing an error.
 */
function deepFreeze(object, visited = new Set()) {
    // Check if the input is an object or array (non-null)
    if (object && typeof object === 'object') {
        // Handle specific types: skip ArrayBuffer, TypedArrays, Dates, and ObjectId
        if (object instanceof ArrayBuffer || ArrayBuffer.isView(object) || object instanceof Date || object.constructor.name === 'ObjectId') {
            return object; // Skip freezing if it's an ArrayBuffer, TypedArray, Date, or ObjectId
        }

        // Avoid circular references by checking if the object has already been visited
        if (visited.has(object)) {
            return object; // Skip freezing if already visited
        }

        // Mark the object as visited
        visited.add(object);

        // Freeze the object itself
        Object.freeze(object);

        // Recursively freeze each property if it's an object/array
        Object.keys(object).forEach((key) => {
            const value = object[key];

            if (typeof value === 'object' && value !== null) {
                deepFreeze(value, visited);
            }
        });
    }
    return object;
}

/**
 * Sanitizes a MongoDB object by removing `__v` and replacing `_id` with `id`.
 * @param {Object} mongoObject - The MongoDB object to sanitize.
 * @returns {Object} - The sanitized object.
 */
function sanitizeMongoObject(mongoObject) {
    if (!mongoObject) return mongoObject;

    const sanitizedObject = {...mongoObject};

    // Remove __v and replace _id with id
    delete sanitizedObject.__v;
    if (sanitizedObject._id) {
        sanitizedObject.id = sanitizedObject._id.toString();
        delete sanitizedObject._id;
    }

    return sanitizedObject;
}

module.exports = {deepFreeze, sanitizeMongoObject};
