import {useCallback, useRef} from "react";

/**
 * useClickCooldown
 * Returns a function that can be used to limit how often an action can be performed.
 * Useful for preventing rapid repeated clicks.
 *
 * @param {number} cooldown - Minimum time in milliseconds between allowed actions (default: 500)
 * @returns {function(): boolean} - Function that returns `true` if action is allowed, `false` if still in cooldown
 *
 * @example
 * const canClick = useClickCooldown(1000);
 * if (canClick()) {
 *   console.log("Action allowed!");
 * } else {
 *   console.log("Wait before next click");
 * }
 */
const useClickCooldown = (cooldown = 500) => {
    const lastAction = useRef(0);
    return useCallback(() => {
        const now = Date.now();
        if (now - lastAction.current < cooldown) return false;
        lastAction.current = now;
        return true;
    }, [cooldown]);
};

export default useClickCooldown;
