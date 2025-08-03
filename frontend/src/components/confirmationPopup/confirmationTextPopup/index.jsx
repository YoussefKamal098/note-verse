import React, {useState, useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import {
    Overlay,
    Modal,
    Header,
    Body,
    Instruction,
    Title,
    TextInput,
    Footer,
    Description,
} from './styles';

const animation = {
    initial: {opacity: 0, scale: 0.95},
    animate: {opacity: 1, scale: 1},
    exit: {opacity: 0, scale: 0.95},
    transition: {duration: 0.2},
};

const sanitize = (str) => str?.replace(/[\r\n]+/g, '');

const ConfirmationTextPopup = ({
                                   open = true,
                                   onClose,
                                   onConfirm,
                                   confirmText,
                                   title = 'Confirm',
                                   description = 'Type the name to confirm',
                                   confirmButtonType = BUTTON_TYPE.DANGER,
                                   confirmButtonText = 'Confirm',
                               }) => {
    const [text, setText] = useState(sanitize(confirmText));
    const [input, setInput] = useState('');

    useEffect(() => {
        setText(sanitize(confirmText));
    }, [confirmText]);

    useEffect(() => {
        if (!open) setInput('');
    }, [open]);

    const handleConfirm = () => {
        if (input === text) {
            onConfirm?.();
            setInput('');
        }
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setInput('');
            onClose?.();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <Overlay
                    as={motion.div}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                    onClick={handleOverlayClick}
                >
                    <Modal
                        {...animation}
                        as={motion.div}
                    >
                        <Header>
                            <Title>{title}</Title>
                            <Description>{description}</Description>
                        </Header>

                        <Body>
                            <Instruction>
                                Please type <strong style={{color: 'var(--color-primary)'}}>{text}</strong> to
                                confirm.
                            </Instruction>
                            <TextInput
                                value={input}
                                onChange={(e) => setInput(sanitize(e.target.value))} placeholder="Type here..."
                            />
                        </Body>

                        <Footer>
                            <Button type={BUTTON_TYPE.SECONDARY} onClick={onClose}>Cancel</Button>
                            <Button
                                type={confirmButtonType}
                                disabled={input !== text}
                                onClick={handleConfirm}
                            >
                                {confirmButtonText}
                            </Button>
                        </Footer>
                    </Modal>
                </Overlay>
            )}
        </AnimatePresence>
    );
};

export default React.memo(ConfirmationTextPopup);
