import React from "react";
import styled from 'styled-components';
import {TranslateTransitionContainer} from "../animations/ContainerAnimation";
import BackHomeButton from "@/components/buttons/BackHomeButton";
import NoteMenu from "@/components/menus/noteMenu";
import Button, {BUTTON_TYPE, ButtonsContainerStyles} from "@/components/buttons/Button";
import UserDetailsWithNoteMeta from "@/components/userDetails/UserDetailsWithNoteMeta";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import {useUserOnlineStatus} from "@/hooks/useUserOnlineStatus";
import ReactionButton from "@/components/reaction";

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
    gap: 0.5em
`

const NoteActionGroupStyles = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
`;

const NoteHeader = ({actions}) => {
    const {selectors} = useNoteContext();
    const {isNew, isLoading, editMode} = useNoteSelector(selectors.getStatus);
    const isOwner = useNoteSelector(selectors.isOwner);
    const canEdit = useNoteSelector(selectors.canEdit);
    const {current} = useNoteSelector(selectors.getContent);
    const hasChanges = useNoteSelector(selectors.hasChanges);
    const owner = useNoteSelector(selectors.getOwner);
    const userReaction = useNoteSelector(selectors.getUserReaction);
    const {isPublic, isPinned, createdAt} = useNoteSelector(selectors.getMeta);

    const {isOnline} = useUserOnlineStatus(owner?.id);

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
                    isOnline={isOnline}
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
                        <NoteActionGroupStyles>
                            <ReactionButton
                                value={userReaction}
                                onChange={(reaction) => actions.updateReaction(reaction)}
                            />

                            <NoteMenu
                                onDelete={!isNew && isOwner ? actions.onDelete : undefined}
                                onEdit={!isNew && canEdit ? actions.onEdit : undefined}
                                onCopyLink={!isNew ? actions.onCopyLink : undefined}
                                onShowShare={!isNew && isOwner ? actions.onShowShare : undefined}
                                onShowCommitHistory={!isNew && !editMode ? actions.onShowCommitHistory : undefined}
                                onTogglePin={isOwner ? actions.onTogglePin : undefined}
                                onToggleVisibility={isOwner ? actions.onToggleVisibility : undefined}
                                isPinned={isPinned}
                                isVisible={isPublic}
                            />
                        </NoteActionGroupStyles>
                    </TranslateTransitionContainer>
                )}
            </HeaderRightPartContainerStyles>

        </HeaderWrapperStyles>
    );
}

export default React.memo(NoteHeader);
