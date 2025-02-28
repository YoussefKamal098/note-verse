import {deepFreeze} from "shared-utils/obj.utils";

const animations = {
    visible: {
        opacity: {
            duration: 0.4,
        },
        y: {
            duration: 0.35,
        },
        delayPerBox: 0.1
    },
    error: {
        borderColor: {
            duration: 0.2,
            delayPerBox: 0.1
        },
        scale: {
            duration: 0.5,
            delayPerBox: 0.1
        },
        x: {
            duration: 0.3,
            delayBase: 0.2,
            delayPerBox: 0.1
        }
    }
};

const computeAnimationDelays = {
    error: (length) => {
        const border = (length - 1) * animations.error.borderColor.delayPerBox + animations.error.borderColor.duration;
        const scale = (length - 1) * animations.error.scale.delayPerBox + animations.error.scale.duration;
        const x = length * animations.error.x.delayPerBox + animations.error.x.delayBase + animations.error.x.duration;
        return Math.max(border, scale, x) * 1000;
    },
    visible: (length) => {
        const lastBoxDelay = (length - 1) * animations.visible.delayPerBox;
        return Math.max(
            lastBoxDelay + animations.visible.opacity.duration,
            lastBoxDelay + animations.visible.y.duration
        ) * 1000;
    }
};

/**
 * Animation configurations for various animation states.
 *
 * Contains predefined timing configurations for "visible" and "error" animation states.
 * - The **visible** state defines transitions for opacity and vertical (y) movement,
 *   with a delay applied per box.
 * - The **error** state defines transitions for border color, scale, and horizontal (x) movement,
 *   each with their own duration, base delay, and per-box delay.
 *
 * @constant
 * @type {Object}
 * @property {Object} visible - Animation configuration for the visible state.
 * @property {Object} visible.opacity - Opacity animation configuration.
 * @property {number} visible.opacity.duration - Duration of the opacity transition in seconds.
 * @property {Object} visible.y - Vertical (y) animation configuration.
 * @property {number} visible.y.duration - Duration of the vertical transition in seconds.
 * @property {number} visible.delayPerBox - Delay applied per box for the visible state animations, in seconds.
 * @property {Object} error - Animation configuration for the error state.
 * @property {Object} error.borderColor - Border color animation configuration.
 * @property {number} error.borderColor.duration - Duration of the border color transition in seconds.
 * @property {number} error.borderColor.delayPerBox - Delay per box for the border color transition, in seconds.
 * @property {Object} error.scale - Scale animation configuration.
 * @property {number} error.scale.duration - Duration of the scale transition in seconds.
 * @property {number} error.scale.delayPerBox - Delay per box for the scale transition, in seconds.
 * @property {Object} error.x - Horizontal (x) animation configuration.
 * @property {number} error.x.duration - Duration of the horizontal transition in seconds.
 * @property {number} error.x.delayBase - Base delay for the horizontal transition, in seconds.
 * @property {number} error.x.delayPerBox - Delay per box for the horizontal transition, in seconds.
 */
const frozenAnimations = deepFreeze(animations);
/**
 * Utility functions to compute total animation delays based on the number of animated elements.
 *
 * Provides methods to calculate the cumulative animation delay for different animation states (error and visible)
 * based on the number of boxes. The computed delay is returned in milliseconds.
 *
 * @constant
 * @type {Object}
 * @property {function(number): number} error - Computes the delay for error animations.
 *    The delay is calculated as the maximum of:
 *      - The border color delay: (length - 1) * animations.error.borderColor.delayPerBox + animations.error.borderColor.duration,
 *      - The scale delay: (length - 1) * animations.error.scale.delayPerBox + animations.error.scale.duration,
 *      - The horizontal (x) delay: length * animations.error.x.delayPerBox + animations.error.x.delayBase + animations.error.x.duration.
 *    The result is multiplied by 1000 to convert seconds to milliseconds.
 * @property {function(number): number} visible - Computes the delay for visible animations.
 *    The delay is calculated as the maximum of:
 *      - (length - 1) * animations.visible.delayPerBox + animations.visible.opacity.duration,
 *      - (length - 1) * animations.visible.delayPerBox + animations.visible.y.duration.
 *    The result is multiplied by 1000 to convert seconds to milliseconds.
 */
const frozenComputeAnimationDelays = deepFreeze(computeAnimationDelays);

export {
    frozenAnimations as animations,
    frozenComputeAnimationDelays as computeAnimationDelays
};
