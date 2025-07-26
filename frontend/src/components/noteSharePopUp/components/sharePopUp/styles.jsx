import styled from "styled-components";
import {motion} from 'framer-motion';

const PopUpBackdropStyles = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    font-weight: 600;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
`;

const PopUpContainerStyles = styled(motion.div)`
    position: relative;
    background: var(--color-background);
    border-radius: 8px;
    width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    margin: 20px;
    overflow: hidden;
`;

const MainContentStyles = styled.div`
    position: relative;
    padding: 1.5rem;
    overflow-y: auto;
`;

export {
    PopUpBackdropStyles,
    PopUpContainerStyles,
    MainContentStyles
}
