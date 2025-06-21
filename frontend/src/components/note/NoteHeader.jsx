import React from "react";
import styled from 'styled-components';
import {TranslateTransitionContainer} from "../animations/ContainerAnimation";
import BackHomeButton from "../buttons/BackHomeButton";
import NoteMenu from "../menus/noteMenu";
import AuthorInfoWithTimestamp from "./AuthorInfoWithTimestamp";
import Button, {BUTTON_TYPE, ButtonsContainerStyled} from "../buttons/Button";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext"

const HeaderWrapperStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    margin-bottom: 2em;
`

const HeaderLeftPartContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em
`

const NoteHeader = ({actions}) => {
    const {selectors} = useNoteContext();

    const {isNew, initLoading, isLoading, editMode} = useNoteSelector(selectors.getStatus);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const owner = useNoteSelector(selectors.getOwner);
    const {isPinned, createdAt} = useNoteSelector(selectors.getMeta);

    return (
        <HeaderWrapperStyled>
            <HeaderLeftPartContainerStyled>
                <BackHomeButton/>

                <AuthorInfoWithTimestamp
                    firstname={owner?.firstname}
                    lastname={owner?.lastname}
                    createdAt={createdAt}
                    avatarUrl={owner?.avatarUrl}
                    loading={initLoading}
                />
            </HeaderLeftPartContainerStyled>

            {isNew || editMode || hasChanges ? (
                <TranslateTransitionContainer keyProp={"note_save_discard"}>
                    <ButtonsContainerStyled>
                        <Button
                            type={BUTTON_TYPE.SECONDARY}
                            onClick={actions.onDiscard}
                        >
                            Discard
                        </Button>
                        <Button
                            type={BUTTON_TYPE.SUCCESS}
                            onClick={actions.onSave}
                            disabled={!hasChanges}
                            loading={isLoading}
                        >
                            Save
                        </Button>
                    </ButtonsContainerStyled>
                </TranslateTransitionContainer>
            ) : (
                <TranslateTransitionContainer
                    keyProp={"note_memu"}
                >
                    <NoteMenu
                        onDelete={!isNew && isOwner ? actions.onDelete : undefined}
                        onTogglePin={!isNew && isOwner ? actions.onTogglePin : undefined}
                        onEdit={!isNew && canEdit ? actions.onEdit : undefined}
                        onCopyLink={!isNew ? actions.onCopyLink : undefined}
                        onShowShare={!isNew && isOwner ? actions.onShowShare : undefined}
                        isPinned={isPinned}
                    />
                </TranslateTransitionContainer>
            )}
        </HeaderWrapperStyled>
    );
}

export default React.memo(NoteHeader);
