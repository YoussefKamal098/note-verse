import styled from "styled-components";
import {motion} from "framer-motion";

const ContainerStyles = styled(motion.div)`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: var(--color-background);
    z-index: 10;
`

const CloseButtonWrapper = styled.div`
    position: absolute;
    top: 0.5em;
    right: 0.5em;
`

export {
    ContainerStyles,
    CloseButtonWrapper
};
