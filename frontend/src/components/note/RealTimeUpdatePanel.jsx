import React, {} from 'react';
import {SiSocketdotio} from "react-icons/si";
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import {useNoteSocket} from "./hooks/useNoteSocket";
import SidePanel from './SidePanel';

const RealTimeUpdatePanel = ({show, onClose, isMobile}) => {
    const {selectors} = useNoteContext();
    const {id} = useNoteSelector(selectors.getMeta);

    useNoteSocket({
        noteId: id,
        onNoteUpdate: ({versionId}) => {
            console.log('Note updated remotely:', versionId);
            // TODO: Replace this with actual real-time update UI in next commit
        }
    });

    return (
        <SidePanel
            show={show}
            onClose={onClose}
            title="Real Time Updates"
            Icon={SiSocketdotio}
            area="realtime_updates_panel"
            isMobile={isMobile}
        >
            {/* TODO: Add real-time update content here in a future commit */}
        </SidePanel>
    );
};

export default React.memo(RealTimeUpdatePanel);
