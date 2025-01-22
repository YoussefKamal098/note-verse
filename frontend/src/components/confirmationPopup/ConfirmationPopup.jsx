import React, {useRef} from "react";
import PropTypes from "prop-types";
import {FadeInAnimation} from "../animations/ContainerAnimation";
import {FaExclamationTriangle, FaInfoCircle} from "react-icons/fa";
import Button, {BUTTON_TYPE, ButtonsContainerStyled} from "../buttons/Button";
import {PopupContainer, PopUpOverlay} from "./ConfirmationPopupStyles";

const POPUP_TYPE = Object.freeze({
    INFO: "info",
    OK: "ok",
    DANGER: "danger"
});

const POPUP_PROPS = Object.freeze({
    [POPUP_TYPE.DANGER]: {
        color: "var(--color-danger)",
        confirmationButtonType: BUTTON_TYPE.DANGER,
        icon: <FaExclamationTriangle/>
    },
    [POPUP_TYPE.INFO]: {
        color: "var(--color-accent)",
        confirmationButtonType: BUTTON_TYPE.INFO,
        icon: <FaInfoCircle/>
    },
    [POPUP_TYPE.OK]: {
        color: "var(--color-primary)",
        confirmationButtonType: BUTTON_TYPE.INFO,
        icon: <FaInfoCircle/>
    }
});

const renderButtons = (type, onConfirm, onCancel) => {
    if (type === POPUP_TYPE.OK) {
        return (
            <Button type={POPUP_PROPS[type].confirmationButtonType} onClick={onConfirm}> OK </Button>
        );
    }

    return (
        <>
            <Button type={POPUP_PROPS[type].confirmationButtonType} onClick={onConfirm}> Confirm </Button>
            <Button onClick={onCancel}> Cancel </Button>
        </>
    );
};

const ConfirmationPopup = ({
                               type = POPUP_TYPE.INFO,
                               confirmationMessage = "Are you sure?",
                               onConfirm = () => ({}),
                               onCancel = () => ({})
                           }) => {
    const popupRef = useRef(null);

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            type === POPUP_TYPE.OK ? onConfirm() : onCancel();
        }
    };

    return (
        <PopUpOverlay onClick={handleClickOutside} aria-modal="true" role="dialog">
            <FadeInAnimation keyProp="popUpAnimation">
                <PopupContainer ref={popupRef} onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-text">
                        <span className="icon" style={{color: POPUP_PROPS[type].color}}>
                            {POPUP_PROPS[type].icon}
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
    type: PropTypes.oneOf(Object.values(POPUP_TYPE)),
    confirmationMessage: PropTypes.string,
    onConfirm: PropTypes.func.isRequired,
    onCancel: PropTypes.func
};

export {POPUP_TYPE};
export default ConfirmationPopup;
