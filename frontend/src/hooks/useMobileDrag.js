import {useEffect, useRef, useState} from "react";

const useMobileDrag = (isMobile, onDragEnd, threshold = 100) => {
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const pointerStartYRef = useRef(0);
    const windowHeight = window.innerHeight;

    useEffect(() => {
        if (!isMobile) {
            setDragOffset(0);
        }
    }, [isMobile]);

    const handlePointerDown = (e) => {
        if (isMobile) {
            setIsDragging(true);
            pointerStartYRef.current = e.clientY;
        }
    };

    const handlePointerMove = (e) => {
        if (isMobile && isDragging) {
            const deltaY = e.clientY - pointerStartYRef.current;
            if (deltaY > 0) {
                setDragOffset(deltaY);
            }

            const remainingFromBottom = windowHeight - pointerStartYRef.current - dragOffset;
            if (remainingFromBottom < threshold && onDragEnd) {
                handlePointerUp();
            }
        }
    };

    const handlePointerUp = () => {
        if (isMobile && isDragging) {
            const remainingFromBottom = windowHeight - pointerStartYRef.current - dragOffset;
            if (remainingFromBottom < threshold && onDragEnd) {
                onDragEnd();
            }

            setDragOffset(0);
            setIsDragging(false);
        }
    };

    return {dragOffset, handlePointerDown, handlePointerMove, handlePointerUp};
};

export default useMobileDrag;
