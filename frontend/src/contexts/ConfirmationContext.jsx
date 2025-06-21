import React, {createContext, useContext, useState} from "react";
import ConfirmationPopup, {POPUP_TYPE} from "../components/confirmationPopup/ConfirmationPopup";

const ConfirmationContext = createContext({showConfirmation: (config) => (config)});
const useConfirmation = () => useContext(ConfirmationContext);

const ConfirmationPopUpProvider = ({children}) => {
    const [popupConfig, setPopupConfig] = useState({isVisible: false});

    const showConfirmation = ({type = POPUP_TYPE.INFO, confirmationMessage, onConfirm, onCancel}) => {
        setPopupConfig({
            isVisible: true,
            type,
            confirmationMessage,
            onConfirm: () => {
                onConfirm();
                hideConfirmation();
            },
            onCancel: () => {
                onCancel && onCancel();
                hideConfirmation();
            },
        });
    };

    const hideConfirmation = () => setPopupConfig({isVisible: false});

    return (
        <ConfirmationContext.Provider value={{showConfirmation}}>
            <ConfirmationPopup
                show={popupConfig.isVisible}
                type={popupConfig.type}
                confirmationMessage={popupConfig.confirmationMessage}
                onConfirm={popupConfig.onConfirm}
                onCancel={popupConfig.onCancel}
            />
            {children}
        </ConfirmationContext.Provider>
    );
};

export {useConfirmation};
export default ConfirmationPopUpProvider
