const timeUnit = Object.freeze({
    YEAR: 'YEAR',
    MONTH: 'MONTH',
    DAY: 'DAY',
    HOUR: 'HOUR',
    MINUTE: 'MINUTE',
    SECOND: 'SECOND',
    MILLISECOND: 'MILLISECOND',
});

/**
 * Converts input time units into a specific output time unit.
 * @param {Object} timeUnits - Object with keys as `timeUnit` and values as numbers.
 * @param {string} output - Desired output unit, one of the values in `timeUnit`.
 * @returns {number} - The total time in the specified output unit.
 */
function time(timeUnits = {}, output = timeUnit.SECOND) {
    const conversionFactors = {
        [timeUnit.YEAR]: 365 * 24 * 60 * 60 * 1000,
        [timeUnit.MONTH]: 30 * 24 * 60 * 60 * 1000,
        [timeUnit.DAY]: 24 * 60 * 60 * 1000,
        [timeUnit.HOUR]: 60 * 60 * 1000,
        [timeUnit.MINUTE]: 60 * 1000,
        [timeUnit.SECOND]: 1000,
        [timeUnit.MILLISECOND]: 1,
    };

    // Validate the output unit
    if (!Object.values(timeUnit).includes(output)) {
        throw new Error(`Invalid output time unit: ${output}`);
    }

    // Validate and process the input time units
    const totalMilliseconds = Object.entries(timeUnits).reduce((total, [unit, value]) => {
        // Check if the value is a number and non-negative
        if (typeof value !== 'number' || value < 0) {
            throw new Error(`Invalid value for ${unit}: Value must be a non-negative number.`);
        }

        if (!conversionFactors[unit]) {
            throw new Error(`Invalid input time unit: ${unit}`);
        }

        return total + value * conversionFactors[unit];
    }, 0);

    const outputFactor = conversionFactors[output];
    return totalMilliseconds / outputFactor;
}

/**
 * Adds or subtracts a duration to/from the current date, depending on whether the value is positive or negative.
 * @param {Object} duration - Object with keys as `timeUnit` and values as numbers (can be positive or negative).
 * @returns {Date} - The new date with the duration added or subtracted.
 */
function timeFromNow(duration = {}) {
    const currentDate = new Date();

    // Validate and process each unit in the duration
    Object.entries(duration).forEach(([unit, value]) => {
        // Check if the value is a number
        if (typeof value !== 'number') {
            throw new Error(`Invalid value for ${unit}: Value must be a number.`);
        }

        // Validate if the unit is a valid time unit
        if (!Object.values(timeUnit).includes(unit)) {
            throw new Error(`Invalid time unit: ${unit}`);
        }

        // Determine the direction (add or subtract) based on the sign of the value
        const isNegative = value < 0;
        const absValue = Math.abs(value);

        switch (unit) {
            case timeUnit.YEAR:
                currentDate.setFullYear(currentDate.getFullYear() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.MONTH:
                currentDate.setMonth(currentDate.getMonth() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.DAY:
                currentDate.setDate(currentDate.getDate() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.HOUR:
                currentDate.setHours(currentDate.getHours() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.MINUTE:
                currentDate.setMinutes(currentDate.getMinutes() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.SECOND:
                currentDate.setSeconds(currentDate.getSeconds() + (isNegative ? -absValue : absValue));
                break;
            case timeUnit.MILLISECOND:
                currentDate.setMilliseconds(currentDate.getMilliseconds() + (isNegative ? -absValue : absValue));
                break;
            default:
                throw new Error(`Invalid time unit: ${unit}`);
        }
    });

    return currentDate;
}

/**
 * Formats a date into a readable string (e.g., "Fri, Jan 17, 2025, at 10:30 AM").
 *
 * @param {Date | string} date - The date to format.
 * @returns {string} - The formatted date string.
 */
function formatDate(date) {
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
}

/**
 * Converts a duration string or a date string into a Date object.
 *
 * Supported duration formats:
 *  - "7s"   : 7 seconds
 *  - "10m"  : 10 minutes
 *  - "5h"   : 5 hours
 *  - "2d"   : 2 days
 *  - "2w"   : 2 weeks
 *  - "3M"   : 3 months (approx. 30 days per month)
 *  - "1y"   : 1 year (approx. 365 days)
 *
 * If the input is not a duration string, it attempts to create a Date from it.
 *
 * @param {string|number|Date} timeInput - A duration string (e.g., "7d") or a date string/number.
 * @returns {Date} The calculated or parsed Date object.
 * @throws {Error} If the input format is invalid.
 */
function parseTime(timeInput) {
    // If the input is already a Date, return it.
    if (timeInput instanceof Date) {
        return timeInput;
    }

    // If the input is a number, treat it as a timestamp.
    if (typeof timeInput === 'number') {
        return new Date(timeInput);
    }

    // If the input is a string, try to parse it as a duration.
    if (typeof timeInput === 'string') {
        const durationRegex = /^(\d+)([smhdwMy])$/;
        const match = durationRegex.exec(timeInput.trim());
        if (match) {
            const value = parseInt(match[1], 10);
            const unit = match[2]; // preserve a case for month ('M') and year ('y')
            let milliseconds = 0;

            switch (unit) {
                case 's': // seconds
                    milliseconds = value * 1000;
                    break;
                case 'm': // minutes (lowercase 'm')
                    milliseconds = value * 60 * 1000;
                    break;
                case 'h': // hours
                    milliseconds = value * 60 * 60 * 1000;
                    break;
                case 'd': // days
                    milliseconds = value * 24 * 60 * 60 * 1000;
                    break;
                case 'w': // weeks
                    milliseconds = value * 7 * 24 * 60 * 60 * 1000;
                    break;
                case 'M': // months (uppercase 'M') - approximated as 30 days per month
                    milliseconds = value * 30 * 24 * 60 * 60 * 1000;
                    break;
                case 'y': // years - approximated as 365 days per year
                    milliseconds = value * 365 * 24 * 60 * 60 * 1000;
                    break;
                default:
                    throw new Error("Unsupported time unit");
            }
            return new Date(Date.now() + milliseconds);
        }

        // If not a duration, try to parse it as a date string.
        const date = new Date(timeInput);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }

    throw new Error("Invalid time format");
}


/**
 * Compares two dates and returns a comparison result.
 *
 * @param {Date|string|number} date1 - The first date to compare. Accepts a Date object, a string in a valid date format, or a timestamp.
 * @param {Date|string|number} date2 - The second date to compare. Accepts a Date object, a string in a valid date format, or a timestamp.
 * @returns {number} - Returns:
 *   0 if both dates are equal,
 *   1 if date1 is greater than date2,
 *  -1 if date1 is less than date2.
 * @throws {TypeError} - Throws an error if the input is not a valid date or cannot be converted to a date.
 */
function compareDates(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
        throw new TypeError("Invalid date input. Ensure inputs can be parsed as dates.");
    }

    if (d1.getTime() === d2.getTime()) return 0;
    return d1.getTime() > d2.getTime() ? 1 : -1;
}

module.exports = {timeUnit, time, timeFromNow, parseTime, formatDate, compareDates};
