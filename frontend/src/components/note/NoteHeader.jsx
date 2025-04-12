import React, {Suspense} from "react";
import styled from 'styled-components';
import {PuffLoader} from "react-spinners";
import Loader from "../common/Loader";
import Tooltip from "../tooltip/Tooltip";
import AuthorInfoWithTimestamp from "./AuthorInfoWithTimestamp";
import BackHomeButton from "../buttons/BackHomeButton";

const NoteMenu = React.lazy(() => import("../menus/noteMenu/NoteMenu"));

const HeaderContainerStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    margin-bottom: 2em;
`

const ChangesIndicator = ({onSave}) => {
    return (
        <Tooltip title={"Save Your Changes – Click to finalize your commit!"}>
            <div style={{cursor: "pointer"}} onClick={onSave}>
                <PuffLoader color={"var(--color-accent)"} size={25}/>
            </div>
        </Tooltip>
    );
}

const NoteHeader = ({user, actions, noteState}) => {
    return (
        <HeaderContainerStyled>
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25em"
            }}>
                <BackHomeButton/>
                <AuthorInfoWithTimestamp
                    fullName={`${user.firstname || ""} ${user.lastname || ""}`}
                    createdAt={noteState.createdAt}
                    avatarUrl={user.avatarUrl}
                />
                {noteState.hasChanges && <ChangesIndicator onSave={actions.onSave}/>}
            </div>

            <Suspense fallback={<Loader/>}>
                <NoteMenu
                    onDelete={actions.onDelete}
                    onSave={actions.onSave}
                    onDiscard={actions.onDiscard}
                    onTogglePin={actions.onTogglePin}
                    isPinned={noteState.isPinned}
                    disableSave={!noteState.hasChanges}
                    disableDiscard={!noteState.hasChanges}
                    disableDelete={(!noteState.id || noteState.id === "new")}
                />
            </Suspense>
        </HeaderContainerStyled>
    );
}

export default React.memo(NoteHeader);
