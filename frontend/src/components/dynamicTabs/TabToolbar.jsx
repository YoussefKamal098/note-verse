import React, {useState} from "react";
import { MdFullscreen } from "react-icons/md";
import { ToolbarStyled } from "./DynamicTabsStyles";

export const TabToolbar = () => {
    const [fullScreen, setFullScreen] = useState(false);

    return (
        <ToolbarStyled>
            <MdFullscreen onClick={() => setFullScreen(!fullScreen)} className={fullScreen ? "tool full-screen" : "tool"}/>
        </ToolbarStyled>
    )
}