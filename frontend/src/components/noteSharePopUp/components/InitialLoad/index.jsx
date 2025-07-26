import React from "react"
import {AnimatePresence} from "framer-motion";
import LoadingEffect from "../../../common/LoadingEffect"
import {ContainerStyles, CloseButtonWrapper} from "./styles";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import CloseButton from "@/components/buttons/CloseButton";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";

const InitialLoad = ({onClose}) => {
    const {selectors, actions} = useSharePopUp();
    const isLoading = useSharePopUpSelector(selectors.getInitLoading);
    const initError = useSharePopUpSelector(selectors.getInitError);

    return (
        <AnimatePresence>
            {(isLoading || initError) && (
                <ContainerStyles
                    initial={{opacity: 1}}
                    exit={{opacity: 0}}
                    transition={{duration: 0.3}}
                >
                    {!isLoading &&
                        <CloseButtonWrapper>
                            <CloseButton onClick={onClose}/>
                        </CloseButtonWrapper>}
                    {isLoading && <LoadingEffect color={"var(--color-accent)"} loading={isLoading} size={50}/>}
                    {!isLoading && initError &&
                        <Button type={BUTTON_TYPE.INFO} onClick={actions.fetchInitialData}>Try again</Button>}
                </ContainerStyles>
            )}
        </AnimatePresence>
    );
}

export default React.memo(InitialLoad)
