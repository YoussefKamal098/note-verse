import React, {useEffect, useRef, useState} from "react";
import {StyledArrow, StyledTooltipWrapper} from "./TooltipStyled";
import PropTypes from "prop-types";
import ReactDOM from "react-dom";
import {useGlobalSettings} from "../../contexts/GlobalSettingsContext";

const Tooltip = ({title, children, position = "bottom"}) => {
    const [show, setShow] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({left: 0, top: 0});
    const {appRef} = useGlobalSettings();
    const tooltipRef = useRef(null);
    const targetRef = useRef(null);
    const marginTop = 10;

    useEffect(() => {
        if (show && targetRef.current) {
            const targetRect = targetRef.current.getBoundingClientRect();
            const tooltipRect = tooltipRef.current.getBoundingClientRect();

            // Adjust position based on the target's position
            let newLeft = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
            let newTop = position === "top" ? targetRect.top - tooltipRect.height - marginTop : targetRect.bottom + marginTop;

            setTooltipPosition({
                left: newLeft,
                top: newTop,
            });
        }
    }, [show, position]);


    return (
        <div
            ref={targetRef}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {ReactDOM.createPortal(
                <StyledTooltipWrapper
                    ref={tooltipRef}
                    show={show ? "true" : undefined}
                    style={{left: `${tooltipPosition.left}px`, top: `${tooltipPosition.top}px`}}>
                    {title}
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

export default Tooltip;