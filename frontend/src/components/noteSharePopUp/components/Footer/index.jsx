import React from "react";
import {WidthTransitionContainer} from "../../../animations/ContainerAnimation";
import Button, {BUTTON_TYPE, ButtonsContainerStyled} from "../../../buttons/Button";
import {FooterContainerStyles} from "./styles";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";

const Footer = ({inputRef}) => {
    const {actions, selectors} = useSharePopUp();
    const newCollaboratorsCount = useSharePopUpSelector(selectors.getNewCollaboratorsCount);
    const removedCollaboratorsCount = useSharePopUpSelector(selectors.getRemovedCollaboratorsCount);
    const updatedCollaboratorsCount = useSharePopUpSelector(selectors.getUpdatedCollaboratorsCount);
    const isLoading = useSharePopUpSelector(selectors.getIsLoading);

    const onDone = async () => {
        await actions.saveChanges();
    }

    const onCancel = () => {
        actions.clearNewCollaborator();
        inputRef.current?.resetInput?.();
    }

    const onSend = async () => {
        await actions.saveChanges();
        inputRef.current?.resetInput?.();
    }

    return (
        <FooterContainerStyles>
            <WidthTransitionContainer>
                {newCollaboratorsCount > 0 ? (
                    <ButtonsContainerStyled>
                        <Button
                            type={BUTTON_TYPE.DANGER}
                            onClick={onCancel}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type={BUTTON_TYPE.SUCCESS}
                            onClick={onSend}
                            loading={isLoading}
                        >
                            Send
                        </Button>
                    </ButtonsContainerStyled>
                ) : (
                    <Button
                        key="done-button"
                        type={BUTTON_TYPE.INFO}
                        onClick={onDone}
                        disabled={!removedCollaboratorsCount && !updatedCollaboratorsCount}
                    >
                        Done
                    </Button>
                )}
            </WidthTransitionContainer>
        </FooterContainerStyles>
    );
}

export default React.memo(Footer);
