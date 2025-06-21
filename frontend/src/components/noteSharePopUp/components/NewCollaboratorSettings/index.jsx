import React from "react";
import permissionOptions from "../../constants/permissionOptions";
import {useSharePopUp, useSharePopUpSelector} from "../../hooks/useSharePopUp";
import {HeightTransitionContainer} from "../../../animations/ContainerAnimation";
import Select from "../../../selection";
import Checkbox from "../../../checkBox";
import TextArea from "../../../textarea";
import {SectionStyles} from "../styles";
import {CollaboratorsInputSettingsRowStyles} from "./styles";

const NewCollaboratorsSettings = () => {
    const {actions, selectors} = useSharePopUp();

    // Using optimized selectors
    const newCollaboratorsSize = useSharePopUpSelector(selectors.getNewCollaboratorsCount);
    const {role, notify, message} = useSharePopUpSelector(selectors.getShareSettings);

    return (
        <HeightTransitionContainer>
            {newCollaboratorsSize > 0 && (
                <SectionStyles>
                    <CollaboratorsInputSettingsRowStyles>
                        <Select
                            options={permissionOptions}
                            defaultValue={role}
                            onOptionsChange={actions.updateNewCollaboratorRole}
                        />
                        <Checkbox
                            label="Notify people"
                            checked={notify}
                            onChange={actions.updateNotifySetting}
                        />
                    </CollaboratorsInputSettingsRowStyles>

                    <HeightTransitionContainer>
                        {notify && (
                            <TextArea
                                label="Description"
                                value={message}
                                onChange={(e) => actions.updateMessage(e.target.value)}
                                spellCheck={false}
                                rows={10}
                            />
                        )}
                    </HeightTransitionContainer>
                </SectionStyles>
            )}
        </HeightTransitionContainer>
    );
}

export default React.memo(NewCollaboratorsSettings);
