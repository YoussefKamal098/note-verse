import React, {useState} from "react";
import {MdFullscreen} from "react-icons/md";
import {ToolbarStyled, ToolStyled} from "./DynamicTabsStyles";

const TabToolbar = () => {
    const [fullScreen, setFullScreen] = useState(false);

    return (
        <ToolbarStyled>
            <ToolStyled onClick={() => setFullScreen(!fullScreen)}
                        className={fullScreen ? "full-screen" : ""}>
                <MdFullscreen/>
            </ToolStyled>
        </ToolbarStyled>
    )
}

export default TabToolbar;
