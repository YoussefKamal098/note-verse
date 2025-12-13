import {useCallback, useEffect, useRef, useState} from "react";

/**
 * useHoverTimeoutSafe
 * Triggers a callback after a delay when mouse leaves element.
 * Safe for React unmount and memory leaks.
 *
 * @param {number} delay - milliseconds to wait
 * @param {function} callback - function to call after delay
 *
 * @example
 * const { hovering, handleMouseEnter, handleMouseLeave } = useHoverTimeoutSafe(3000, () => setOpen(false));
 */
export function useHoverTimeout(delay = 3000, callback) {
    const [hovering, setHovering] = useState(false);
    const timerRef = useRef(null);
    const isMountedRef = useRef(true);

    // Keep track if component is mounted
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const startTimer = useCallback(() => {
        // clear existing timer
        if (timerRef.current) clearTimeout(timerRef.current);

        timerRef.current = setTimeout(() => {
            if (isMountedRef.current) {
                callback?.();
            }
        }, delay);
    }, [callback, delay]);

    const cancelTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const handleMouseEnter = useCallback(() => {
        setHovering(true);
        cancelTimer();
    }, [cancelTimer]);

    const handleMouseLeave = useCallback(() => {
        setHovering(false);
        startTimer();
    }, [startTimer]);

    return {
        hovering,
        handleMouseEnter,
        handleMouseLeave,
    };
}

export default useHoverTimeout;
