const deepEqualObject = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!obj2.hasOwnProperty(key)) return false;
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object') {
            if (!deepArrayEqual(obj1[key], obj2[key])) return false;
        } else if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
};

const deepArrayEqual = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
        const value1 = arr1[i];
        const value2 = arr2[i];

        if (Array.isArray(value1) && Array.isArray(value2)) {
            // Recursively compare nested arrays
            if (!deepArrayEqual(value1, value2)) {
                return false;
            }
        } else if (typeof value1 === 'object' && typeof value2 === 'object') {
            // Recursively compare objects (deep check)
            if (!deepEqualObject(value1, value2)) {
                return false;
            }
        } else {
            // Compare primitive values
            if (value1 !== value2) {
                return false;
            }
        }
    }

    return true;
};

const stringSizeInBytes = (str) => new TextEncoder().encode(str).length;

const formatDate = (date) => {
    if (!date) return 'N/A';

    const dateObj = new Date(date);
    const weekday = dateObj.toLocaleDateString(undefined, {weekday: 'short'});
    const month = dateObj.toLocaleDateString(undefined, {month: 'short'});
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();

    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12 || 12; // If hours are 0, set to 12

    return `${weekday}, ${month} ${day}, ${year}, at ${hours}:${minutes} ${ampm}`;
};

const formatBytes = (sizeInBytes) => {
    if (sizeInBytes > 1024 * 1024) return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    if (sizeInBytes > 1024) return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    return `${sizeInBytes} Bytes`;
};

const getInitials = (firstName, lastName) => {
    if (!firstName || !lastName) return '';

    // Getting initials
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();

    return `${firstInitial}${lastInitial}`;
};

const capitalizeStringFirstLetter = (str) => {
    if (!str) return '';

    // Capitalizing the first letter of the string
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export {
    formatDate,
    formatBytes,
    stringSizeInBytes,
    deepArrayEqual,
    deepEqualObject,
    getInitials,
    capitalizeStringFirstLetter,
};
