import React from 'react';
import styled from 'styled-components';
import {TbSettingsSpark} from "react-icons/tb";
import {MdPublic, MdVpnLock} from 'react-icons/md';
import {RiPushpin2Fill, RiUnpinLine} from 'react-icons/ri';
import Toggle from '@/components/toggle';
import SidePanel from './SidePanel';
import {useNoteContext, useNoteSelector} from './hooks/useNoteContext';

const SettingsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: 0.8em;
`;

const SettingsPanel = ({show, onClose, isMobile}) => {
    const {actions, selectors} = useNoteContext();
    const {isNew} = useNoteSelector(selectors.getStatus);
    const {isPublic, isPinned} = useNoteSelector(selectors.getMeta);

    return (
        <SidePanel
            show={show}
            onClose={onClose}
            title="Settings"
            Icon={TbSettingsSpark}
            area="settings_panel"
            isMobile={isMobile}
        >
            <SettingsContainer>
                <Toggle
                    checked={isPinned}
                    onChange={isNew ? actions.togglePinState : actions.togglePin}
                    label="Pin status"
                    labelPosition="right"
                    icon={isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>}
                />
                <Toggle
                    checked={isPublic}
                    onChange={isNew ? actions.toggleVisibilityState : actions.toggleVisibility}
                    label="Public visibility"
                    labelPosition="right"
                    icon={isPublic ? <MdPublic/> : <MdVpnLock/>}
                />
            </SettingsContainer>
        </SidePanel>
    );
};

export default React.memo(SettingsPanel);
