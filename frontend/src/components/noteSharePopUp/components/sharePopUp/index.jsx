import React, {useEffect, useRef} from 'react';
import {AnimatePresence} from "framer-motion";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import InitialLoad from '../InitialLoad';
import ProgressBar from '../ProgressBar';
import Header from '../Header';
import NewCollaboratorsSection from "../NewCollaboratorsSection"
import CollaboratorSections from "../CollaboratorSections"
import Footer from "../Footer";
import {MainContentStyles, PopUpBackdropStyles, PopUpContainerStyles} from "./styles"

const Index = ({onClose, onVisibilityChange, show = true}) => {
    const {state, selectors, actions} = useSharePopUp();
    const inputRef = useRef(null);
    const firstTimeShow = useRef(true);
    const initError = useSharePopUpSelector(selectors.getInitError);

    useEffect(() => {
        return () => {
            actions.cleanupState(); // Clears all data on unmount
        };
    }, []);

    useEffect(() => {
        onVisibilityChange?.(state.isPublic);
    }, [state.isPublic]);

    useEffect(() => {
        if ((show && firstTimeShow.current) || initError) {
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
                        <InitialLoad onClose={onClose}/>
                        <ProgressBar/>

                        <Header onClose={onClose}/>

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
