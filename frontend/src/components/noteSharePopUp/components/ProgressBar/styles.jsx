import styled from "styled-components";
import {motion} from "framer-motion";

const LoadingOverlayStyles = styled(motion.div)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
`;

const ProgressBarStyles = styled(motion.div)`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    border-radius: 25px;
    background: var(--color-accent);
    transform-origin: 0;
`;

export {
    LoadingOverlayStyles,
    ProgressBarStyles,
}
