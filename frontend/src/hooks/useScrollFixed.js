import {useCallback, useEffect, useRef, useState} from "react";
import {throttle} from "lodash-es";

const useScrollFixed = (ref, options = {}) => {
    const {
        marginTop = 50,
        onFixed = () => ({}),
        onUnfixed = () => ({}),
    } = options;

    const [isFixed, setIsFixed] = useState(false);
    const originalDimensions = useRef(null);
    const prevIsFixed = useRef(isFixed);
    const isResizing = useRef(false);

    // Reset original dimensions helper
    const resetOriginalDimensions = useCallback(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        originalDimensions.current = {
            top: originalDimensions.current?.top ?? rect.y + window.scrollY,
            left: rect.x,
            width: rect.width,
        };
    }, [ref]);

    // Get fixed position styles
    const getFixedStyle = useCallback(() => {
        if (!originalDimensions.current) return {};

        return {
            position: "fixed",
            top: 0,
            left: `${originalDimensions.current.left}px`,
            width: `${originalDimensions.current.width}px`,
            zIndex: 1000,
        };
    }, []);

    // Handle scroll state changes
    const handleScroll = useCallback(throttle(() => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        resetOriginalDimensions();

        const shouldBeFixed = rect.top <= marginTop;
        const shouldRestore = originalDimensions.current &&
            window.scrollY <= originalDimensions.current.top - marginTop;

        setIsFixed(prev => {
            if (shouldRestore) return false;
            return shouldBeFixed ? true : prev;
        });
    }, 100), [marginTop, ref, resetOriginalDimensions]);

    // Handle resize events
    const handleResize = useCallback(() => {
        isResizing.current = true;
        setIsFixed(false);

        setTimeout(() => {
            resetOriginalDimensions();
            handleScroll();
            isResizing.current = false;
        }, 0);
    }, [handleScroll, resetOriginalDimensions]);

    // Handle fixed state changes
    useEffect(() => {
        if (isFixed === prevIsFixed.current) return;

        // Only trigger callbacks if not during resize
        if (!isResizing.current) {
            isFixed ? onFixed() : onUnfixed();
        }

        prevIsFixed.current = isFixed;
    }, [isFixed, onFixed, onUnfixed]);

    // Event listeners setup
    useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        window.addEventListener("resize", handleResize);

        return () => {
            handleScroll.cancel();
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, [handleResize, handleScroll]);

    return {isFixed, getFixedStyle};
};

export default useScrollFixed;