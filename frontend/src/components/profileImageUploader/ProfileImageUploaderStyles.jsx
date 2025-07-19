import styled, {keyframes} from 'styled-components';
import {motion} from 'framer-motion';
import AvatarEditor from 'react-avatar-editor';

// -----------------------
// Animations
// -----------------------

const rotate = keyframes`
    100% {
        transform: rotate(360deg);
    }
`;

const dash = keyframes`
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 100, 200;
        stroke-dashoffset: -15px;
    }
    100% {
        stroke-dasharray: 100, 200;
        stroke-dashoffset: -125px;
    }
`;

// -----------------------
// Loader Styled Components (if used in this component)
// -----------------------

const SvgLoaderStyled = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    translate: -5% -5%;
    width: 110%;
    height: 110%;
    display: block;
    animation: ${rotate} 2s linear infinite;
`;

const CircleStyled = styled.circle`
    stroke: var(--color-accent);
    stroke-linecap: round;
    animation: ${dash} 1.5s ease-in-out infinite;
`;

// -----------------------
// ProfileImageUploader Styled Components
// -----------------------

const ContainerStyled = styled.div`
    height: 100%;
    min-height: 100%;
    aspect-ratio: 1/1;
    display: flex;
    flex-direction: column;
    align-items: center;
`;

const EditorContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    width: 100%;
`;

const AvatarEditorStyled = styled(AvatarEditor)`
    width: 100% !important;
    height: 100% !important;
    border: calc(var(--border-width) * 1.5) solid var(--color-border);
    border-radius: 50%;
    box-shadow: var(--box-shadow);
    margin-bottom: 1rem;
    overflow: hidden;

    &:hover {
        cursor: grab;
    }
`;

const ProfileImageContainerStyled = styled.div`
    position: relative;
    height: 100%;
    min-height: 100%;
    aspect-ratio: 1/1;
    border-radius: 50%;
    overflow: visible;
    margin-bottom: 1rem;
    border: var(--border-width) solid var(--color-border);
`;

const EditButtonStyled = styled.div`
    position: absolute;
    bottom: 10px;
    right: 10px;
    width: 40px;
    height: 40px;
    background-color: var(--color-background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text);
    border: var(--border-width) solid var(--color-border);
    box-shadow: var(--box-shadow);
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: var(--color-text);
        color: var(--color-background);
    }
`;

const HiddenInputStyled = styled.input`
    display: none;
`;

const ControlsStyled = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`;

const ToolsStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

const ControlsButtonsStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
`;

const ToolStyled = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text);
    cursor: pointer;
    transition: 0.3s ease;
    padding: 0.5rem;
    border-radius: var(--border-radius);

    &:hover {
        background-color: var(--color-text);
        color: var(--color-background);
    }
`;

const ModalOverlayStyled = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    overflow-y: auto;
    z-index: 2000;
`;

const ModalContentStyled = styled(motion.div)`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 500px;
    width: 90%;
    padding: 1rem;
    margin: 2rem auto 1rem;
    background: var(--color-background);
    box-shadow: var(--box-shadow-hover);
    border-radius: 8px;
    overflow: hidden;
`;

const HeaderStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    margin-bottom: 2rem;
`;

const TitleStyled = styled.h2`
    font-size: 1.5em;
    color: var(--color-text);
`;

const modalOverlayVariants = {
    hidden: {opacity: 0},
    visible: {opacity: 1},
    exit: {opacity: 0},
};

const modalContentVariants = {
    hidden: {scale: 0.8, opacity: 0},
    visible: {scale: 1, opacity: 1},
    exit: {scale: 0.8, opacity: 0},
};

export {
    SvgLoaderStyled,
    CircleStyled,
    ContainerStyled,
    EditorContainerStyled,
    AvatarEditorStyled,
    ProfileImageContainerStyled,
    EditButtonStyled,
    HiddenInputStyled,
    ControlsStyled,
    ToolsStyled,
    ControlsButtonsStyled,
    ToolStyled,
    ModalOverlayStyled,
    ModalContentStyled,
    HeaderStyled,
    TitleStyled,
    modalOverlayVariants,
    modalContentVariants,
};
