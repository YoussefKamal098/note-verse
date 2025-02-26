/**
 * Animation durations and delay factors (in seconds) for error animations.
 */
const borderColorDuration = 0.2;
const scaleDuration = 0.5;
const xDuration = 0.3;
const borderColorDelayPerBox = 0.1;
const scaleDelayPerBox = 0.1;
const xDelayBase = 0.2;
const xDelayPerBox = 0.1;

/**
 * Computes the clear delay (in milliseconds) based on the error animation durations.
 *
 * @param {number} length - The number of OTP boxes.
 * @returns {number} The clear delay in milliseconds.
 */
const computeErrorAnimateClearDelay = (length) => {
    const lastBoxBorderTotal = (length - 1) * borderColorDelayPerBox + borderColorDuration;
    const lastBoxScaleTotal = (length - 1) * scaleDelayPerBox + scaleDuration;
    const lastBoxXTotal = length * xDelayPerBox + xDelayBase + xDuration;
    return Math.max(lastBoxBorderTotal, lastBoxScaleTotal, lastBoxXTotal) * 1000;
};

export {
    borderColorDuration,
    scaleDuration,
    xDuration,
    borderColorDelayPerBox,
    scaleDelayPerBox,
    xDelayBase,
    xDelayPerBox,
    computeErrorAnimateClearDelay,
}
