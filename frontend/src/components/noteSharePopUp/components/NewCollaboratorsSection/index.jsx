import React from "react";
import CollaboratorsInput from "../../../collaboratorsInput";
import NewCollaboratorsSettings from "../NewCollaboratorSettings";
import {SectionStyles} from "../styles";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";


const NewCollaboratorsSection = ({inputRef}) => {
    const {actions, selectors} = useSharePopUp();
    const suggestions = useSharePopUpSelector(selectors.getSuggestions);
    const newCollaborators = useSharePopUpSelector(selectors.getNewCollaborators);
    const count = useSharePopUpSelector(selectors.getNewCollaboratorsCount);

    const onAddNewCollaborator = async (collaborator) => {
        actions.addNewCollaborator(collaborator);

        if (count === 0) {
            await actions.saveChanges({addNew: false});
        }
    }

    return (
        <SectionStyles>
            <CollaboratorsInput
                ref={inputRef}
                collaborator={newCollaborators}
                placeholder="Add people and groups"
                suggestionsCollaborators={suggestions}
                onCollaboratorAdd={onAddNewCollaborator}
                onCollaboratorRemove={actions.removeNewCollaborator}
            />
            <NewCollaboratorsSettings/>
        </SectionStyles>
    );
}

export default React.memo(NewCollaboratorsSection);
