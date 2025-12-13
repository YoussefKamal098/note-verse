import {useCallback, useEffect, useState} from "react";

/**
 * useElementPosition
 * Tracks the position and size of any element.
 *
 * @param {React.RefObject} elementRef - ref to the target element
 * @param {boolean} watch - optional flag to update position (e.g., when open)
 * @returns {object} { top, left, width, height }
 *
 * @example
 * const pos = useElementPosition(buttonRef, open);
 * <div style={{ top: pos.top, left: pos.left, position: 'fixed' }}>Tooltip</div>
 */
export function useElementPosition(elementRef, watch = false) {
    const [position, setPosition] = useState({top: 0, left: 0, width: 0, height: 0});

    const updatePosition = useCallback(() => {
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        setPosition({
            top: rect.top,
            left: rect.left + rect.width / 2, // center horizontally
            width: rect.width,
            height: rect.height,
        });
    }, [elementRef]);

    useEffect(() => {
        if (!watch) return;

        updatePosition(); // initial update

        // // update on window resize
        // window.addEventListener("resize", updatePosition);
        // return () => window.removeEventListener("resize", updatePosition);
    }, [watch, updatePosition]);

    return position;
}

export default useElementPosition;
