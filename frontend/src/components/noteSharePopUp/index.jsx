import React from "react";
import MainComponent from "./components/sharePopUp"
import SharePopUpProvider from "./context/SharePopUpProvider";

function ShareModal({noteMeta, onVisibilityChange, onClose, show}) {
    return (
        <SharePopUpProvider noteMeta={noteMeta}>
            <MainComponent show={show} onClose={onClose} onVisibilityChange={onVisibilityChange}/>
        </SharePopUpProvider>
    );
}

export default React.memo(ShareModal);
