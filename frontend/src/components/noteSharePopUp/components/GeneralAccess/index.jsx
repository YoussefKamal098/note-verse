import React, {useCallback} from "react";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import Toggle from "../../../toggle";
import {PrivateIconStyles, PublicIconStyles, SectionStyles, SectionTitleStyles} from "../styles";
import {
    AccessDescriptionStyles,
    AccessInfoStyles,
    AccessLeftStyles,
    AccessRightStyles,
    AccessRowStyles,
    AccessTypeStyles
} from "./styles"

const GeneralAccess = () => {
    const {actions, selectors} = useSharePopUp();
    const generalAccess = useSharePopUpSelector(selectors.getGeneralAccess);
    const isLoading = useSharePopUpSelector(state => state.isLoading);

    const onAccessChange = useCallback(async (access) => {
        await actions.updateGeneralAccess(access);
    }, [actions]);

    const accessType = generalAccess ? "Anyone with the link" : "Restricted";
    const Description = generalAccess ?
        'Anyone on the internet with the link can view' :
        'Only people with access can open with the link';

    return (
        <SectionStyles>
            <SectionTitleStyles>Public visibility </SectionTitleStyles>
            <AccessRowStyles>
                <AccessLeftStyles>
                    {generalAccess ? <PublicIconStyles/> : <PrivateIconStyles/>}
                    <AccessInfoStyles>
                        <AccessTypeStyles>
                            {accessType}
                        </AccessTypeStyles>
                        <AccessDescriptionStyles>
                            {Description}
                        </AccessDescriptionStyles>
                    </AccessInfoStyles>
                </AccessLeftStyles>
                <AccessRightStyles>
                    <Toggle
                        checked={generalAccess}
                        onChange={() => onAccessChange(!generalAccess)}
                        disabled={isLoading}
                    />
                </AccessRightStyles>
            </AccessRowStyles>
        </SectionStyles>
    );
}

export default React.memo(GeneralAccess);
