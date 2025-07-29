import React from "react";
import styled from "styled-components";
import ContributorsList from "@/components/contributorsList";
import {ContainerStyles} from "./styles";
import {useNoteContext, useNoteSelector} from "@/components/note/hooks/useNoteContext";

const ContributorsContainerStyles = styled(ContainerStyles)`
    grid-area: contributors;
    padding-bottom: 1.5em;
`;

const Contributors = ({onContributorClick}) => {
    const {selectors} = useNoteContext();
    const {editMode, isNew} = useNoteSelector(selectors.getStatus);
    const {id} = useNoteSelector(selectors.getMeta);
    const owner = useNoteSelector(selectors.getOwner);

    return (
        <>
            {!isNew && !editMode && <ContributorsContainerStyles>
                <ContributorsList
                    noteId={id}
                    noteOwnerId={owner.id}
                    maxVisible={2}
                    onAvatarClick={onContributorClick}
                />
            </ContributorsContainerStyles>}
        </>

    )
}

export default React.memo(Contributors);
