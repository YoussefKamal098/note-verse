import React, {useCallback, useEffect, useRef, useState} from "react";
import ReactDOM from "react-dom";
import {MdFullscreen, MdFullscreenExit} from "react-icons/md";
import Tooltip from "../tooltip/Tooltip";
import {ToolbarStyled, ToolStyled} from "./DynamicTabsStyles";
import {useGlobalSettings} from "../../contexts/GlobalSettingsContext";

const TabToolbar = ({className, tabRef}) => {
    const {appRef} = useGlobalSettings();
    const toolbarRef = useRef(null);
    const [fullScreen, setFullScreen] = useState(false);

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
        >
            <Tooltip title={fullScreen ? "Minimize" : "Maximize"}>
                <ToolStyled onClick={() => setFullScreen(!fullScreen)}>
                    {fullScreen ? <MdFullscreenExit/> : <MdFullscreen/>}
                </ToolStyled>
            </Tooltip>
        </ToolbarStyled>
    ), [className, fullScreen]);

    return (
        <>
            {(fullScreen) && appRef.current
                ? ReactDOM.createPortal(renderToolbar(), appRef.current)
                : renderToolbar()}
        </>
    );
};

export default React.memo(TabToolbar);
