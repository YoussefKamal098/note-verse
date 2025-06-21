import React from "react";
import MainComponent from "./components/sharePopUp"
import SharePopUpProvider from "./context/SharePopUpProvider";

function ShareModal({noteMeta, onClose, show}) {
    return (
        <SharePopUpProvider noteMeta={noteMeta}>
            <MainComponent show={show} onClose={onClose}/>
        </SharePopUpProvider>
    );
}

export default React.memo(ShareModal);
