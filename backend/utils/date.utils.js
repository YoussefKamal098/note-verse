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

module.exports = {timeUnit, time, timeFromNow};