import React, {useCallback, useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {MdFullscreen} from "react-icons/md";
import Tooltip from "../tooltip/Tooltip";
import {ToolbarStyled, ToolStyled} from "./DynamicTabsStyles";
import {NAVBAR_POSITIONS, useGlobalSettings} from "../../contexts/GlobalSettingsContext";
import useScrollFixed from "../../hooks/useScrollFixed";

const TabToolbar = ({className, tabRef}) => {
    const {appRef, setNavbarPosition} = useGlobalSettings();
    const toolbarRef = useRef(null);
    const [fullScreen, setFullScreen] = useState(false);

    const handleFixed = useCallback(() => {
        setNavbarPosition(NAVBAR_POSITIONS.ABSOLUTE);
    }, []);

    const handleUnfixed = useCallback(() => {
        setNavbarPosition(NAVBAR_POSITIONS.FIXED);
    }, []);

    const {isFixed, getFixedStyle} = useScrollFixed(toolbarRef, {
        marginTop: 50,
        onFixed: handleFixed,
        onUnfixed: handleUnfixed,
    });

    // Fullscreen effect
    useEffect(() => {
        if (tabRef.current) {
            tabRef.current.classList.toggle("full-screen", fullScreen);
        }
    }, [fullScreen, tabRef]);

    // Toolbar element rendering
    const renderToolbar = useCallback(() => (
        <ToolbarStyled
            className={`${className} ${fullScreen ? "full-screen" : ""}`}
            ref={toolbarRef}
            style={isFixed ? getFixedStyle() : {}}
        >
            <Tooltip title={fullScreen ? "Normal Screen" : "Full Screen"}>
                <ToolStyled onClick={() => setFullScreen(!fullScreen)}>
                    <MdFullscreen/>
                </ToolStyled>
            </Tooltip>
        </ToolbarStyled>
    ), [className, fullScreen, getFixedStyle, isFixed]);

    return (
        <>
            {(isFixed || fullScreen) && appRef.current
                ? ReactDOM.createPortal(renderToolbar(), appRef.current)
                : renderToolbar()}
        </>
    );
};

export default React.memo(TabToolbar);
