import React, {
    createContext,
    useContext,
    useState,
    useCallback,
    useMemo,
} from 'react';
import ConfirmationPopup, {POPUP_TYPE} from '@/components/confirmationPopup/confirmationMessagePopup';
import ConfirmationTextPopup from '@/components/confirmationPopup/confirmationTextPopup';

const ConfirmationContext = createContext(null);

const useConfirmation = () => useContext(ConfirmationContext);

const ConfirmationPopUpProvider = ({children}) => {
    const [messagePopupConfig, setMessagePopupConfig] = useState({isVisible: false});
    const [textPopupConfig, setTextPopupConfig] = useState({isVisible: false});

    const hideConfirmation = useCallback(() => {
        setMessagePopupConfig({isVisible: false});
    }, []);

    const hideTextConfirmation = useCallback(() => {
        setTextPopupConfig({isVisible: false});
    }, []);

    const showConfirmation = useCallback(({type = POPUP_TYPE.INFO, confirmationMessage, onConfirm, onCancel}) => {
        setMessagePopupConfig({
            isVisible: true,
            type,
            confirmationMessage,
            onConfirm: () => {
                onConfirm?.();
                hideConfirmation();
            },
            onCancel: () => {
                onCancel?.();
                hideConfirmation();
            },
        });
    }, [hideConfirmation]);

    const showTextConfirmation = useCallback(({
                                                  title,
                                                  description,
                                                  confirmText,
                                                  confirmButtonText,
                                                  confirmButtonType,
                                                  onConfirm,
                                                  onCancel,
                                              }) => {
        setTextPopupConfig({
            isVisible: true,
            title,
            description,
            confirmText,
            confirmButtonText,
            confirmButtonType,
            onConfirm: () => {
                onConfirm?.();
                hideTextConfirmation();
            },
            onCancel: () => {
                onCancel?.();
                hideTextConfirmation();
            },
        });
    }, [hideTextConfirmation]);

    const contextValue = useMemo(() => ({
        showConfirmation,
        showTextConfirmation,
    }), [showConfirmation, showTextConfirmation]);

    return (
        <ConfirmationContext.Provider value={contextValue}>
            <ConfirmationPopup
                show={messagePopupConfig.isVisible}
                type={messagePopupConfig.type}
                confirmationMessage={messagePopupConfig.confirmationMessage}
                onConfirm={messagePopupConfig.onConfirm}
                onCancel={messagePopupConfig.onCancel}
            />

            <ConfirmationTextPopup
                open={textPopupConfig.isVisible}
                title={textPopupConfig.title}
                description={textPopupConfig.description}
                confirmText={textPopupConfig.confirmText}
                confirmButtonText={textPopupConfig.confirmButtonText}
                confirmButtonType={textPopupConfig.confirmButtonType}
                onConfirm={textPopupConfig.onConfirm}
                onClose={textPopupConfig.onCancel}
            />

            {children}
        </ConfirmationContext.Provider>
    );
};

export {useConfirmation};
export default React.memo(ConfirmationPopUpProvider);
