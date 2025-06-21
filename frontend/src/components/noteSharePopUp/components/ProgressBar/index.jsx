import React from "react";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import {LoadingOverlayStyles, ProgressBarStyles} from "./styles";

const ProgressBar = () => {
    const {selectors} = useSharePopUp();
    const isLoading = useSharePopUpSelector(selectors.getIsLoading);

    return (
        <LoadingOverlayStyles
            initial={{opacity: 0}}
            animate={{opacity: isLoading ? 1 : 0}}
            transition={{duration: 0.2}}
            style={{pointerEvents: isLoading ? 'auto' : 'none'}}
        >
            <ProgressBarStyles
                initial={{left: "-100%"}}
                animate={{left: "100%"}}
                transition={{duration: 1, repeat: Infinity}}
            />
        </LoadingOverlayStyles>
    )
}

export default React.memo(ProgressBar);
