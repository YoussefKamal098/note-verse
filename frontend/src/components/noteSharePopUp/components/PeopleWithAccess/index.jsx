import React, {useCallback} from "react";
import {permissionActions} from "../../../../constants/roles";
import permissionActionOptions from "../../constants/permissionActionOptions";
import permissionOptions from "../../constants/permissionOptions";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import {useAuth} from "../../../../contexts/AuthContext";
import Avatar from "../../../common/Avatar";
import Select from "../../../selection";
import {SectionStyles, SectionTitleStyles} from "../styles";
import {
    AccessListStyles,
    AvatarWrapperStyles,
    CollaboratorInfoStyles,
    CollaboratorItemStyles,
    CollaboratorLeftStyles,
    EmailStyles,
    EmptyCollaboratorsStyles,
    NameStyles,
    OwnerBadgeStyles,
    YouBadgeStyles
} from "./styles";

const PeopleWithAccess = () => {
    const {actions, selectors} = useSharePopUp();
    const {user} = useAuth();

    const collaborators = useSharePopUpSelector(selectors.getCollaborators);
    const removedCollaborators = useSharePopUpSelector(selectors.getRemovedCollaborators);

    const onPermissionChange = useCallback((id, role) => {
        actions.updateCollaborator(id, role);
    }, [actions]);

    const onPermissionActionChange = useCallback((id, action) => {
        if (action === permissionActions.REMOVE_ACCESS) {
            actions.removeCollaborator(id);
        }
    }, [actions]);

    return (
        <SectionStyles>
            <SectionTitleStyles>People with access</SectionTitleStyles>
            <AccessListStyles>
                {collaborators.length === 0 ? (
                    <EmptyCollaboratorsStyles>
                        No collaborators have access to this note yet.
                    </EmptyCollaboratorsStyles>
                ) : (collaborators.map((collaborator) => (
                    <CollaboratorItemStyles key={collaborator.id}>
                        <CollaboratorLeftStyles>
                            <AvatarWrapperStyles>
                                <Avatar avatarUrl={collaborator.avatarUrl}/>
                            </AvatarWrapperStyles>
                            <CollaboratorInfoStyles>
                                <NameStyles $isStroke={removedCollaborators.includes(collaborator.id)}>
                                    {collaborator.firstname} {collaborator.lastname}
                                    {collaborator.id === user.id && <YouBadgeStyles>(you)</YouBadgeStyles>}
                                </NameStyles>
                                <EmailStyles>{collaborator.email}</EmailStyles>
                            </CollaboratorInfoStyles>
                        </CollaboratorLeftStyles>

                        {collaborator.id !== user.id ? (
                            <Select
                                options={permissionOptions}
                                actions={permissionActionOptions}
                                defaultValue={collaborator.role}
                                onOptionsChange={(value) => onPermissionChange(collaborator.id, value)}
                                onActionsChange={(value) => onPermissionActionChange(collaborator.id, value)}
                            />
                        ) : <OwnerBadgeStyles>Owner</OwnerBadgeStyles>}
                    </CollaboratorItemStyles>
                )))}
            </AccessListStyles>
        </SectionStyles>
    );
}

export default React.memo(PeopleWithAccess);
