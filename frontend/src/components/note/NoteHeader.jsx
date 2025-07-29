import React from "react";
import styled from 'styled-components';
import {TbSettings} from "react-icons/tb";
import {SiSocketdotio} from "react-icons/si";
import {IconButton} from '@mui/material';
import {TranslateTransitionContainer} from "../animations/ContainerAnimation";
import BackHomeButton from "@/components/buttons/BackHomeButton";
import NoteMenu from "@/components/menus/noteMenu";
import Button, {BUTTON_TYPE, ButtonsContainerStyles} from "@/components/buttons/Button";
import UserDetailsWithNoteMeta from "@/components/userDetails/UserDetailsWithNoteMeta";
import useMediaSize from "@/hooks/useMediaSize";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import {DEVICE_SIZES} from "@/constants/breakpoints";

const HeaderWrapperStyles = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    gap: 10px;
    margin-bottom: 1em;
`

const HeaderLeftPartContainerStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em
`

const HeaderRightPartContainerStyles = styled.div`
    display: flex;
    align-items: center;
    gap: 0.25em
`

const IconWrapper = styled.span`
    font-size: 1em;
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

const iconsStyles = {
    color: 'var(--color-text)',
    fontSize: "1.3em",
    padding: "0.15em"
}

const NoteHeader = ({actions}) => {
    const {selectors} = useNoteContext();
    const {isNew, isLoading, editMode} = useNoteSelector(selectors.getStatus);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const {current} = useNoteSelector(selectors.getContent);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const owner = useNoteSelector(selectors.getOwner);
    const {isPublic, createdAt} = useNoteSelector(selectors.getMeta);
    const isMobile = useMediaSize(DEVICE_SIZES.tablet);

    return (
        <HeaderWrapperStyles>
            <HeaderLeftPartContainerStyles>
                <BackHomeButton/>
                <UserDetailsWithNoteMeta
                    firstname={owner?.firstname}
                    lastname={owner?.lastname}
                    createdAt={createdAt}
                    avatarUrl={owner?.avatarUrl}
                    isPublic={isPublic}
                />
            </HeaderLeftPartContainerStyles>

            <HeaderRightPartContainerStyles>
                {isNew || editMode || hasChanges ? (
                    <TranslateTransitionContainer keyProp={"note_save_discard"}>
                        <ButtonsContainerStyles style={{fontSize: "0.9em"}}>
                            <Button
                                type={BUTTON_TYPE.SECONDARY}
                                onClick={actions.onDiscard}
                            >
                                Discard
                            </Button>
                            <Button
                                type={BUTTON_TYPE.SUCCESS}
                                onClick={actions.onSave}
                                disabled={!hasChanges || !current.content.trim()}
                                loading={isLoading && hasChanges}
                            >
                                Save
                            </Button>
                        </ButtonsContainerStyles>
                    </TranslateTransitionContainer>
                ) : (
                    <TranslateTransitionContainer
                        keyProp={"note_menu"}
                    >
                        <NoteMenu
                            onDelete={!isNew && isOwner ? actions.onDelete : undefined}
                            onEdit={!isNew && canEdit ? actions.onEdit : undefined}
                            onCopyLink={!isNew ? actions.onCopyLink : undefined}
                            onShowShare={!isNew && isOwner ? actions.onShowShare : undefined}
                            onShowCommitHistory={!isNew && !editMode ? actions.onShowCommitHistory : undefined}
                        />
                    </TranslateTransitionContainer>
                )}

                {isOwner && isMobile && <IconButton
                    onClick={actions.onSettingsIconClick}
                    aria-label="settings"
                    sx={iconsStyles}
                >
                    <IconWrapper>
                        <TbSettings/>
                    </IconWrapper>
                </IconButton>}

                {isMobile && <IconButton
                    onClick={actions.onRealTimeUpdateIconClick}
                    aria-label="real-time-updates"
                    sx={iconsStyles}
                >
                    <IconWrapper>
                        <SiSocketdotio/>
                    </IconWrapper>
                </IconButton>}
            </HeaderRightPartContainerStyles>

        </HeaderWrapperStyles>
    );
}

export default React.memo(NoteHeader);
