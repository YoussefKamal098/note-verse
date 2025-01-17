import React, {createContext, useContext, useState} from "react";
import ConfirmationPopup from "../components/confirmationPopup/ConfirmationPopup";

const ConfirmationContext = createContext({showConfirmation: (config) => (config)});
const useConfirmation = () => useContext(ConfirmationContext);

const ConfirmationPopUpProvider = ({children}) => {
    const [popupConfig, setPopupConfig] = useState({isVisible: false});

    const showConfirmation = ({type = "info", confirmationMessage, onConfirm, onCancel}) => {
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
            {popupConfig.isVisible && (
                <ConfirmationPopup
                    type={popupConfig.type}
                    confirmationMessage={popupConfig.confirmationMessage}
                    onConfirm={popupConfig.onConfirm}
                    onCancel={popupConfig.onCancel}
                />
            )}
            {children}
        </ConfirmationContext.Provider>
    );
};

export {useConfirmation};
export default ConfirmationPopUpProvider
