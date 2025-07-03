import React, {useEffect, useState} from "react";
import styled from "styled-components";

const Container = styled.div`
    position: absolute;
    user-select: ${({$draggable}) => $draggable ? "none" : "auto"};
    width: auto;
    height: auto;
    z-index: 100;
`;

const DraggableContainer = ({
                                children,
                                className,
                                draggable = true,
                                disabled = false,
                                onPositionChange,
                                initialPosition = {x: 0, y: 0},
                                ...props
                            }) => {
    const [position, setPosition] = useState(initialPosition);
    const [oldPosition, setOldPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});

    useEffect(() => {
        if (disabled) {
            setOldPosition({...position});
            setPosition({x: 0, y: 0});
        } else {
            setPosition({...oldPosition});
        }
    }, [disabled]);

    // Handle position changes
    useEffect(() => {
        onPositionChange?.(position);
    }, [position, onPositionChange]);

    const handleDragStart = (e) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        setPosition({x: newX, y: newY});
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging && draggable && !disabled) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset, disabled]);

    return (
        <Container
            {...props}
            $draggable={draggable}
            className={className}
            style={{
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging && draggable && !disabled ? 'grabbing' : draggable && !disabled ? 'grab' : 'auto',
            }}
            onMouseDown={draggable && !disabled ? handleDragStart : undefined}
        >
            {children}
        </Container>
    );
};

export default DraggableContainer;
