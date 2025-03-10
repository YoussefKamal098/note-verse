/**
 * Recursively freezes an object, making it immutable by preventing further modifications to its properties.
 *
 * - Handles circular references by tracking visited objects.
 * - Skip freezing for specific types: `ArrayBuffer`, TypedArrays, `Date`, and `ObjectId`.
 *
 * @param {Object|Array} object - The object or array to freeze.
 * Must be non-null and of type object.
 * @param {WeakSet<Object>} [visited=new WeakSet()] - A set of objects already visited to avoid circular references.
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
function deepFreeze(object, visited = new WeakSet()) {
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
 * Deeply compares two values (objects, arrays, or primitives).
 *
 * @param {any} value1 - The first value to compare.
 * @param {any} value2 - The second value to compare.
 * @returns {boolean} - True if the values are deeply equal, otherwise false.
 */
function deepEqual(value1, value2) {
    // If the values are strictly equal, return true
    if (value1 === value2) return true;

    // If either value is not an object, they are not deeply equal
    if (typeof value1 !== 'object' || typeof value2 !== 'object' || value1 === null || value2 === null) {
        return false;
    }

    // Handle arrays
    if (Array.isArray(value1) && Array.isArray(value2)) {
        if (value1.length !== value2.length) return false;
        for (let i = 0; i < value1.length; i++) {
            if (!deepEqual(value1[i], value2[i])) return false;
        }
        return true;
    }

    if (Array.isArray(value1) || Array.isArray(value2)) return false;

    // Handle objects
    const keys1 = Object.keys(value1);
    const keys2 = Object.keys(value2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        // Compare the values
        if (!(key in value2) || !deepEqual(value1[key], value2[key])) {
            return false;
        }
    }

    return true;
}

/**
 * Performs a deep clone of a given value.
 *
 * Supports cloning of:
 * - Primitive values (returned as-is)
 * - Dates, RegExps, Arrays, Objects, Maps, Sets
 * - Custom class instances (clones own enumerable properties and preserves prototype)
 *
 * Functions are not cloned but returned by reference.
 *
 * Circular references are handled using a WeakMap.
 *
 * @param {*} value - The value to deep clone.
 * @param {WeakMap} [hash=new WeakMap()] - Internal parameter to track cloned objects.
 * @returns {*} A deep clone of the input value.
 */
function deepClone(value, hash = new WeakMap()) {
    // Return primitives or functions as-is.
    if (Object(value) !== value || typeof value === 'function') return value;

    // Return already cloned reference for circular structures.
    if (hash.has(value)) return hash.get(value);

    let result;
    // Handle Date
    if (value instanceof Date) {
        result = new Date(value);
    }
    // Handle RegExp
    else if (value instanceof RegExp) {
        result = new RegExp(value.source, value.flags);
    }
    // Handle Map
    else if (value instanceof Map) {
        result = new Map();
        hash.set(value, result);
        for (const [key, val] of value) {
            result.set(deepClone(key, hash), deepClone(val, hash));
        }
    }
    // Handle Set
    else if (value instanceof Set) {
        result = new Set();
        hash.set(value, result);
        for (const item of value) {
            result.add(deepClone(item, hash));
        }
    }
    // Handle Array
    else if (Array.isArray(value)) {
        result = [];
        hash.set(value, result);
        value.forEach((item, index) => {
            result[index] = deepClone(item, hash);
        });
    }
    // Handle Object (and custom class instances)
    else {
        // Create a new object with the same prototype as the original.
        result = Object.create(Object.getPrototypeOf(value));
        hash.set(value, result);
        for (const key of Object.keys(value)) {
            result[key] = deepClone(value[key], hash);
        }
    }

    return result;
}

module.exports = {deepFreeze, deepEqual, deepClone};
