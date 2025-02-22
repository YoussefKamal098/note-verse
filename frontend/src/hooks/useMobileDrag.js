import {useRef, useState} from "react";

const useMobileDrag = (isMobile, threshold = 100, onDragEnd) => {
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const pointerStartYRef = useRef(0);

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
        }
    };

    const handlePointerUp = () => {
        if (isMobile && isDragging) {
            if (dragOffset > threshold && onDragEnd) {
                onDragEnd();
            }
            setDragOffset(0);
            setIsDragging(false);
        }
    };

    const mobileDragStyle = isMobile ? {
        transform: `translateY(${dragOffset}px)`,
        transition: dragOffset === 0 ? "transform 300ms ease-out" : "none",
    } : {};

    return {mobileDragStyle, handlePointerDown, handlePointerMove, handlePointerUp};
};

export default useMobileDrag;
