import React, {createContext, useContext, useEffect, useState} from "react";

const ThemeContext = createContext({
    theme: "dark",
    setTheme: ({}) => {}
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

    useEffect(() => {
        localStorage.setItem("theme", theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export { useTheme };
export default ThemeProvider;
