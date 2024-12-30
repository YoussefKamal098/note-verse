import React, { createContext, useContext, useState } from "react";

const ThemeContext = createContext({
    theme: "light",
    setTheme: () => {}
});

const useTheme = () => useContext(ThemeContext);

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState("light");

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export { useTheme };
export default ThemeProvider;
