import React, {useEffect, useRef} from 'react';
import {AnimatePresence} from "framer-motion";
import CloseButton from "../../../buttons/CloseButton";
import {useSharePopUp} from "../../hooks/useSharePopUp";
import InitialLoad from '../InitialLoad';
import ProgressBar from '../ProgressBar';
import NewCollaboratorsSection from "../NewCollaboratorsSection"
import CollaboratorSections from "../CollaboratorSections"
import Footer from "../Footer";
import {MainContentStyles, PopUpBackdropStyles, PopUpContainerStyles, PopUpHeaderStyles} from "./styles"

const Index = ({show = true, onClose}) => {
    const {actions} = useSharePopUp();
    const inputRef = useRef(null);
    const firstTimeShow = useRef(true);

    useEffect(() => {
        if (show && firstTimeShow.current) {
            firstTimeShow.current = false;
            actions.fetchInitialData();
        }
    }, [show]);

    return (
        <AnimatePresence>
            {show && (<PopUpBackdropStyles
                    onClick={onClose}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    exit={{opacity: 0}}
                >
                    <PopUpContainerStyles
                        onClick={(e) => e.stopPropagation()}
                        initial={{opacity: 0, scale: 0.9}}
                        animate={{opacity: 1, scale: 1}}
                        exit={{opacity: 0, scale: 0.9}}
                    >
                        <InitialLoad/>
                        <ProgressBar/>

                        <PopUpHeaderStyles>
                            <h3>Share with people and groups</h3>
                            <CloseButton onClick={onClose}/>
                        </PopUpHeaderStyles>

                        <MainContentStyles>
                            <NewCollaboratorsSection inputRef={inputRef}/>
                            <CollaboratorSections/>
                        </MainContentStyles>

                        <Footer inputRef={inputRef}/>
                    </PopUpContainerStyles>
                </PopUpBackdropStyles>
            )}
        </AnimatePresence>
    );
};

export default React.memo(Index);
