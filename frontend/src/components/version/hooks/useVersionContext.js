import {useContext} from 'react';
import VersionContext from '../context/versionContext';

export const useVersionContext = () => {
    const context = useContext(VersionContext);
    if (!context) throw new Error('useVersionContext must be used within VersionProvider');
    return context;
};

export const useVersionSelector = (selector) => {
    const {state} = useVersionContext();
    return selector(state);
};
