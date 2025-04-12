import React, {useState} from 'react';
import styled from 'styled-components';
import {FaTimes} from 'react-icons/fa';
import {AnimatePresence, motion} from 'framer-motion';

const overlayVariants = {
    visible: {
        opacity: 1,
        backdropFilter: 'blur(3px)',
        transition: {duration: 0.2, ease: 'easeInOut'}
    },
    hidden: {
        opacity: 0,
        backdropFilter: 'blur(0px)'
    }
};

const popupVariants = {
    hidden: {
        opacity: 0,
        y: -50,
        scale: 0.95
    },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {type: 'spring', stiffness: 100, damping: 20}
    },
    exit: {
        opacity: 0,
        y: 50,
        scale: 0.9,
        transition: {duration: 0.15}
    }
};

const PopupOverlayStyled = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);;
    overflow-y: auto;
    z-index: 2000;
`;

const PopupContentStyled = styled(motion.div)`
    position: relative;
    background: var(--color-background-primary);
    padding: 2rem;
    border-radius: var(--border-radius);
    width: 90%;
    max-width: 500px;
    margin: 2rem auto 1rem;
    box-shadow: var(--box-shadow);
    overflow: hidden;
`;

const HeaderStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
`;

const TitleStyled = styled.h3`
    margin: 0;
    color: var(--color-text);
`;

const CloseIconStyled = styled(FaTimes)`
    cursor: pointer;
    color: var(--color-text);
    transition: color 0.2s;

    &:hover {
        color: var(--color-danger);
    }
`;

const ButtonGroupStyled = styled.div`
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
`;

const ButtonStyled = styled.button`
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-weight: 600;
    transition: opacity 0.2s;
    flex: 1;

    &:hover {
        opacity: 0.8;
    }
`;

const SaveButtonStyled = styled(ButtonStyled)`
    background: var(--color-accent);
    color: white;
`;

const CancelButtonStyled = styled(ButtonStyled)`
    background: var(--color-background-secondary);
    color: var(--color-text);
`;

const EditPopUp = ({
                       openElement,
                       onClose,
                       title,
                       children,
                       onSave,
                       showDefaultClose = true
                   }) => {
    const [isOpen, setIsOpen] = useState(false);

    const onPopUpOpen = () => {
        setIsOpen(true);
    };

    const onPopUpClose = () => {
        setIsOpen(false);
        onClose && onClose();
    }

    const onPopUpSave = () => {
        setIsOpen(false);
        onSave && onSave();
    }

    return (
        <>
            <div onClick={onPopUpOpen}>
                {openElement}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <PopupOverlayStyled
                        onClick={onPopUpClose}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={overlayVariants}
                    >
                        <PopupContentStyled
                            onClick={(e) => e.stopPropagation()}
                            variants={popupVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <HeaderStyled>
                                <TitleStyled>{title}</TitleStyled>
                                {showDefaultClose && <CloseIconStyled onClick={onPopUpClose}/>}
                            </HeaderStyled>

                            {children}

                            <ButtonGroupStyled>
                                <CancelButtonStyled onClick={onPopUpClose}>Cancel</CancelButtonStyled>
                                <SaveButtonStyled onClick={onPopUpSave}>Save Changes</SaveButtonStyled>
                            </ButtonGroupStyled>
                        </PopupContentStyled>
                    </PopupOverlayStyled>
                )}
            </AnimatePresence>
        </>

    );
};

export default React.memo(EditPopUp);
