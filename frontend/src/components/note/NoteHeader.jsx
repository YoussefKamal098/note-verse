import React, {Suspense} from "react";
import styled from 'styled-components';
import Loader from "../common/Loader";
import AuthorInfoWithTimestamp from "./AuthorInfoWithTimestamp";
import BackHomeButton from "../buttons/BackHomeButton";

const NoteMenu = React.lazy(() => import("../menus/noteMenu/NoteMenu"));

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

const NoteHeader = ({user, actions, noteState}) => {
    return (
        <HeaderWrapperStyled>
            <HeaderLeftPartContainerStyled style={{}}>
                <BackHomeButton/>

                <AuthorInfoWithTimestamp
                    fullName={`${user.firstname || ""} ${user.lastname || ""}`}
                    createdAt={noteState.createdAt}
                    avatarUrl={user.avatarUrl}
                />
            </HeaderLeftPartContainerStyled>

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
        </HeaderWrapperStyled>
    );
}

export default React.memo(NoteHeader);
