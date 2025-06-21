import React from "react"
import {AnimatePresence} from "framer-motion";
import LoadingEffect from "../../../common/LoadingEffect"
import {ContainerStyles} from "./styles";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";

const InitialLoad = () => {
    const {selectors} = useSharePopUp();
    const isLoading = useSharePopUpSelector(selectors.getInitLoading);

    return (
        <AnimatePresence>
            {isLoading && (
                <ContainerStyles
                    initial={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.3}}
                >
                    <LoadingEffect color={"var(--color-accent)"} loading={isLoading} size={50}/>
                </ContainerStyles>
            )}
        </AnimatePresence>
    );
}

export default React.memo(InitialLoad)
