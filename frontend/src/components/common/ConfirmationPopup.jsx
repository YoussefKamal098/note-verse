import React, { useRef } from "react";
import styled from "styled-components";
import { FadeInAnimation } from "../animations/ContainerAnimation";
import { FaInfoCircle, FaExclamationTriangle } from "react-icons/fa";
import Button, { ButtonsContainerStyled } from "../buttons/Button";

const Overlay = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(0.2em);
    z-index: 1000;
`;

const PopupContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 2em;
    align-items: center;
    background-color: var(--color-background);
    padding: 1em;
    border-radius: var(--border-radius);
    width: 75vw;
    max-width: 30em;
    box-shadow: var(--box-shadow);
    position: relative;

    .confirm-text {
        align-self: flex-start;
        display: flex;
        align-items: center;
        gap: 0.5em;
        font-size: 1em;
        font-weight: 500;
        text-align: left;
        color: var(--color-placeholder);
    }
    
    .icon {
        align-self: flex-start;
        font-size: 1.1em;
    }

    .controlling-buttons {
        font-size: 0.9em;
        align-self: flex-end;
        display: flex;
        gap: 0.5em;
    }
`;

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
        <Overlay onClick={handleClickOutside}>
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
        </Overlay>
    );
};

export default ConfirmationPopup;
