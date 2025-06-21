import {useContext} from 'react';
import SharePopUpContext from '../context/SharePopUpContext';

export const useSharePopUp = () => {
    const context = useContext(SharePopUpContext);
    if (!context) {
        throw new Error('useSharePopUp must be used within SharePopUpProvider');
    }
    return context;
};

export const useSharePopUpSelector = (selector) => {
    const {state} = useSharePopUp();
    return selector(state);
};
