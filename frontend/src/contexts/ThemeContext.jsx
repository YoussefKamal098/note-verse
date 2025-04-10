import React, {createContext, useContext} from "react";
import usePersistedState from "../hooks/usePersistedState";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: (theme) => (theme)
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({children}) => {
    const [theme, setTheme] = usePersistedState("theme", "dark");

    return (
        <ThemeContext.Provider value={{theme, setTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export {useTheme};
export default ThemeProvider;

