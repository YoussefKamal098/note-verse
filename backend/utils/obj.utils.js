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

module.exports = { deepFreeze };
