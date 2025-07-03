import React, {useState} from "react";
import styled from "styled-components";
import Button, {BUTTON_TYPE, ButtonsContainerStyles} from "@/components/buttons/Button";
import CloseButton from "@/components/buttons/CloseButton";
import TextArea from "@/components/textarea";
import Modal from "@/components/modal";

const PopupContainer = styled.div`
    background: var(--color-background);
    padding: 24px;
    width: 100%;
    height: 100%;
`;

const Header = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2em;
    font-weight: bold;
`;

const TextAreaContainer = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
`;

const CommitMessagePopup = ({isOpen, onClose, onSave}) => {
    const [message, setMessage] = useState("");
    const [disableSave, setDisableSave] = useState(true);

    const handleSave = () => {
        if (message.trim()) {
            onSave?.(message.trim());
            setMessage("");
        }
    };

    const handleClose = () => {
        setMessage("");
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            width="90vw"
            maxWidth="500px"
        >
            <PopupContainer>
                <Header>
                    Write a commit Message
                    <CloseButton onClick={handleClose}/>
                </Header>

                <TextAreaContainer>
                    <TextArea
                        label="Enter commit message..."
                        maxLength={500}
                        minLength={10}
                        value={message}
                        onError={(error) => setDisableSave(!!error)}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={10}
                        spellCheck={false}
                    />
                </TextAreaContainer>

                <ButtonsContainerStyles>
                    <Button type={BUTTON_TYPE.SECONDARY} onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button disabled={disableSave} type={BUTTON_TYPE.DANGER} onClick={handleSave}>
                        Save
                    </Button>
                </ButtonsContainerStyles>
            </PopupContainer>
        </Modal>
    );
};

export default React.memo(CommitMessagePopup);
