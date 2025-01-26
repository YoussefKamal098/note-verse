import React, {createContext, useContext, useRef, useState} from 'react';

const NAVBAR_POSITIONS = Object.freeze({
    FIXED: 'fixed',
    ABSOLUTE: 'absolute'
});

const GlobalSettingsContext = createContext({
    navbarPosition: NAVBAR_POSITIONS.FIXED,
    setNavbarPosition: () => {
        throw new Error('GlobalSettingsProvider not found in component tree');
    },
    appRef: {current: null}
});

const useGlobalSettings = () => useContext(GlobalSettingsContext);

export const GlobalSettingsProvider = ({children}) => {
    const [navbarPosition, setNavbarPosition] = useState('fixed');
    const appRef = useRef(null);

    const value = {
        navbarPosition,
        setNavbarPosition,
        appRef
    };

    return (
        <GlobalSettingsContext.Provider value={value}>
            {children}
        </GlobalSettingsContext.Provider>
    );
};

export {useGlobalSettings, NAVBAR_POSITIONS};
export default GlobalSettingsProvider;
