import React from "react";
import {HeightTransitionContainer} from "../../../animations/ContainerAnimation";
import PeopleWithAccess from "../PeopleWithAccess";
import GeneralAccess from "../GeneralAccess";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";

const CollaboratorSections = () => {
    const {selectors} = useSharePopUp();
    const newCollaboratorsSize = useSharePopUpSelector(selectors.getNewCollaboratorsCount);

    return (
        <HeightTransitionContainer>
            {newCollaboratorsSize === 0 && (
                <>
                    <PeopleWithAccess/>
                    <GeneralAccess/>
                </>
            )}
        </HeightTransitionContainer>
    );
};

export default React.memo(CollaboratorSections);
