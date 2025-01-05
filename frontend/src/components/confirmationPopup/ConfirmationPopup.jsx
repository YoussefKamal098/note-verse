import React, {useRef} from "react";
import PropTypes from "prop-types";
import {FadeInAnimation} from "../animations/ContainerAnimation";
import {FaExclamationTriangle, FaInfoCircle} from "react-icons/fa";
import Button, {ButtonsContainerStyled} from "../buttons/Button";
import {PopupContainer, PopUpOverlay} from "./ConfirmationPopupStyles";

const POPUP_TYPES = {
    danger: {
        color: "var(--color-danger)",
        buttonType: "danger",
        icon: <FaExclamationTriangle/>
    },
    info: {
        color: "var(--color-accent)",
        buttonType: "primary",
        icon: <FaInfoCircle/>
    },
    okOnly: {
        color: "var(--color-primary)",
        buttonType: "primary",
        icon: <FaInfoCircle/>
    }
};

const renderButtons = (type, onConfirm, onCancel) => {
    if (type === "okOnly") {
        return (
            <Button type={POPUP_TYPES[type].buttonType} onClick={onConfirm}> OK </Button>
        );
    }
    
    return (
        <>
            <Button type={POPUP_TYPES[type].buttonType} onClick={onConfirm}> Confirm </Button>
            <Button onClick={onCancel}> Cancel </Button>
        </>
    );
};

const ConfirmationPopup = ({
                               type = "info",
                               confirmationMessage = "Are you sure?",
                               onConfirm = () => {
                               },
                               onCancel = () => {
                               }
                           }) => {
    const popupRef = useRef(null);

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            type === "okOnly" ? onConfirm() : onCancel();
        }
    };

    return (
        <PopUpOverlay onClick={handleClickOutside} aria-modal="true" role="dialog">
            <FadeInAnimation keyProp="popUpAnimation">
                <PopupContainer ref={popupRef} onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-text">
                        <span className="icon" style={{color: POPUP_TYPES[type].color}}>
                            {POPUP_TYPES[type].icon}
                        </span>
                        {confirmationMessage}
                    </div>
                    <ButtonsContainerStyled className="controlling-buttons">
                        {renderButtons(type, onConfirm, onCancel)}
                    </ButtonsContainerStyled>
                </PopupContainer>
            </FadeInAnimation>
        </PopUpOverlay>
    );
};

ConfirmationPopup.propTypes = {
    type: PropTypes.oneOf(["danger", "info", "okOnly"]),
    confirmationMessage: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func
};

export default ConfirmationPopup;
