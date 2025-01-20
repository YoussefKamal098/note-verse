import React from "react";
import styled from "styled-components";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";
import Tooltip from "../tooltip/Tooltip";
import {useTheme} from "../../contexts/ThemeContext";

const ColorModeIconStyled = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.75em;
    height: 1.75em;
    font-size: 1.5em;
    color: var(--color-placeholder);
    border-radius: 50%;
    transition: 0.3s ease;
    cursor: pointer;

    &:hover {
        background-color: var(--color-background-secondary);
        color: var(--color-primary);
    }
`

const ColorModeButton = () => {
    const {theme, setTheme} = useTheme();

    const onColorModeIconClick = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return (
        <Tooltip title={theme === "dark" ? "Light Mode" : "Dark Mode"}>
            <ColorModeIconStyled onClick={onColorModeIconClick}>
                {theme === "dark" ? <MdOutlineLightMode/> : <MdOutlineDarkMode/>}
            </ColorModeIconStyled>
        </Tooltip>
    );
}

export default ColorModeButton;