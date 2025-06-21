import React, {createContext, useContext, useMemo, useRef} from 'react';

const GlobalSettingsContext = createContext({
    appRef: {current: null}
});

const useGlobalSettings = () => useContext(GlobalSettingsContext);

export const GlobalSettingsProvider = ({children}) => {
    const appRef = useRef(null);

    const value = useMemo(() => ({
        appRef
    }), []);

    return (
        <GlobalSettingsContext.Provider value={value}>
            {children}
        </GlobalSettingsContext.Provider>
    );
};

export {useGlobalSettings};
export default GlobalSettingsProvider;
