import React, { useRef } from "react";
import { FadeInAnimation } from "../animations/ContainerAnimation";
import { FaExclamationTriangle, FaInfoCircle}  from "react-icons/fa";
import Button, { ButtonsContainerStyled } from "../buttons/Button";
import { PopUpOverlay, PopupContainer } from "./ConfirmationPopupStyles";

const POPUP_TYPES = {
    danger: {
        color: "var(--color-danger)",
        buttonType: "danger",
        icon: <FaExclamationTriangle />
    },
    info: {
        color: "var(--color-accent)",
        buttonType: "primary",
        icon: <FaInfoCircle />
    }
};

const ConfirmationPopup = ({
                               type = "danger",
                               confirmationMessage = "Are you sure?",
                               onConfirm = () => {},
                               onCancel = () => {}
                           }) => {
    const popupRef = useRef(null);

    const handleClickOutside = (event) => {
        if (popupRef.current && !popupRef.current.contains(event.target)) {
            onCancel();
        }
    };

    return (
        <PopUpOverlay onClick={handleClickOutside}>
            <FadeInAnimation keyProp={"popUpAnimation"}>
                <PopupContainer ref={popupRef} onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-text">
                    <span className="icon" style={{ color: POPUP_TYPES[type].color }}>
                        {POPUP_TYPES[type].icon}
                    </span>
                        {confirmationMessage}
                    </div>
                    <ButtonsContainerStyled className="controlling-buttons">
                        <Button type={POPUP_TYPES[type].buttonType} onClick={onConfirm}>Confirm</Button>
                        <Button onClick={onCancel}>Cancel</Button>
                    </ButtonsContainerStyled>
                </PopupContainer>
            </FadeInAnimation>
        </PopUpOverlay>
    );
};

export default ConfirmationPopup;
