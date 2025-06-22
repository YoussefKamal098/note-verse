import React from "react";
import styled from 'styled-components';
import {TbSettings} from "react-icons/tb";
import {IconButton} from '@mui/material';
import {TranslateTransitionContainer} from "../animations/ContainerAnimation";
import BackHomeButton from "../buttons/BackHomeButton";
import NoteMenu from "../menus/noteMenu";
import UserProfileWithMeta from "./UserProfileWithMeta";
import Button, {BUTTON_TYPE, ButtonsContainerStyled} from "../buttons/Button";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext"


const HeaderWrapperStyled = styled.div`
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    font-size: 1em;
    gap: 10px;
    margin-bottom: 1em;
`

const HeaderLeftPartContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em
`

const HeaderRightPartContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em
`

const SettingsIconWrapper = styled.div`
    font-size: 0.9em;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: var(--color-text);
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
        color: var(--color-accent);
    }
`;

const NoteHeader = ({actions}) => {
    const {selectors} = useNoteContext();

    const {isNew, initLoading, isLoading, editMode} = useNoteSelector(selectors.getStatus);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const owner = useNoteSelector(selectors.getOwner);
    const {isPinned, isPublic, createdAt} = useNoteSelector(selectors.getMeta);

    return (
        <HeaderWrapperStyled>
            <HeaderLeftPartContainerStyled>
                <BackHomeButton/>
                <UserProfileWithMeta
                    firstname={owner?.firstname}
                    lastname={owner?.lastname}
                    createdAt={createdAt}
                    avatarUrl={owner?.avatarUrl}
                    isPublic={isPublic}
                    loading={initLoading}
                />
            </HeaderLeftPartContainerStyled>

            <HeaderRightPartContainerStyled>
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
                                loading={isLoading && hasChanges}
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

                {isOwner && <IconButton
                    onClick={actions.onSettingsIconClick}
                    aria-label="settings"
                    sx={{color: 'var(--color-text)'}}
                >
                    <SettingsIconWrapper>
                        <TbSettings/>
                    </SettingsIconWrapper>
                </IconButton>}
            </HeaderRightPartContainerStyled>

        </HeaderWrapperStyled>
    );
}

export default React.memo(NoteHeader);
