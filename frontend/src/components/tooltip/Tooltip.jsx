import React, {useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import {useGlobalSettings} from "@/contexts/GlobalSettingsContext";
import {StyledArrow, StyledTooltipWrapper} from "./TooltipStyled";

const Tooltip = ({title, children, position = "bottom", targetRect, containerStyle}) => {
    const [show, setShow] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({left: 0, top: 0});
    const {appRef} = useGlobalSettings();
    const tooltipRef = useRef(null);
    const targetRef = useRef(null);
    const marginTop = 10;

    useEffect(() => {
        if (targetRect) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            setTooltipPosition({
                left: targetRect.left + targetRect.width / 2 - tooltipRect.width / 2,
                top: position === "top" ? targetRect.top - targetRect.height - marginTop : targetRect.top + targetRect.height + marginTop
            });
        }
    }, [targetRect]);

    useEffect(() => {
        if (show && !targetRect && targetRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            const localTargetRect = targetRef.current.getBoundingClientRect();

            // Adjust position based on the target's position
            let newLeft = localTargetRect.left + localTargetRect.width / 2 - tooltipRect.width / 2;
            let newTop = position === "top" ? localTargetRect.top - tooltipRect.height - marginTop : localTargetRect.bottom + marginTop;

            setTooltipPosition({
                left: newLeft,
                top: newTop,
            });
        }
    }, [show, position]);


    return (
        <div
            ref={targetRef}
            onPointerEnter={() => setShow(true)}
            onPointerLeave={() => setShow(false)}
            style={containerStyle}
        >
            {children}
            {ReactDOM.createPortal(
                <StyledTooltipWrapper
                    ref={tooltipRef}
                    show={show ? "true" : undefined}
                    style={{
                        left: `${tooltipPosition.left}px`,
                        top: `${tooltipPosition.top}px`
                    }}>
                    {show && title}
                    <StyledArrow position={position}/>
                </StyledTooltipWrapper>, appRef.current
            )}
        </div>
    );
};

Tooltip.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    position: PropTypes.oneOf(["top", "bottom"]),
};

export default React.memo(Tooltip);
