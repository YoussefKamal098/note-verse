import styled from 'styled-components';
import {motion} from 'framer-motion';

const ProgressiveImageWrapperStyled = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`;

const ProgressivePlaceholderWrapperStyled = styled.div`
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ProgressiveStyled = styled(motion.img)`
    background-color: var(--color-background-secondary);
    width: 100%;
    height: 100%;
    min-width: 100%;
    min-height: 100%;
    font-size: 1em;
    font-weight: 600;
    border-radius: 50%;
    object-fit: cover;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
`;

const ProgressivePlaceholderStyled = styled(ProgressiveStyled)`
    filter: blur(6px);
    transform: scale(1);
`;

const ProgressiveHighResStyled = styled(ProgressiveStyled)``;

export {
    ProgressiveImageWrapperStyled,
    ProgressivePlaceholderWrapperStyled,
    ProgressivePlaceholderStyled,
    ProgressiveHighResStyled,
}
