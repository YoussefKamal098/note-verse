import React, {useCallback, useState} from 'react';
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {useConfirmation} from "@/contexts/ConfirmationContext";
import useNoteActions from "@/hooks/useNoteActions";
import Overlay from "@/components/common/Overlay";
import CardHeader from './Header';
import CardContent from './Content';
// import NoteTags from './Tags';
import {CardStyles} from './Styles';
import {BUTTON_TYPE} from "@/components/buttons/Button";

const NoteCard = React.memo(({note, onTogglePin, onDelete}) => {
    const [isPinned, setIsPinned] = useState(note.isPinned);
    const [loading, setLoading] = useState(false);
    const {notify} = useToastNotification();
    const {showTextConfirmation} = useConfirmation();
    const {saveNoteUpdates, deleteNote: handleNoteDelete} = useNoteActions(note.id);

    const handleTogglePin = async () => {
        try {
            setLoading(true);
            await saveNoteUpdates({isPinned: !isPinned});
            setIsPinned(!isPinned);
            onTogglePin?.(note.id);
        } catch (error) {
            notify.error(`Failed to ${isPinned ? "unpin" : "pin"} the note:  ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = useCallback(() => {
        showTextConfirmation({
            title: "Delete Note",
            description: "Are you sure you want to permanently delete this note? This action cannot be undone.",
            confirmText: note.title,
            confirmButtonText: "Delete",
            confirmButtonType: BUTTON_TYPE.DANGER,
            onConfirm: async () => {
                try {
                    setLoading(true);
                    await onDelete?.(note.id);
                    await handleNoteDelete();
                } catch (error) {
                    notify.error(`Deleting note Error:  ${error.message}`);
                } finally {
                    setLoading(false);
                }
            }
        });
    }, [showTextConfirmation, onDelete, handleNoteDelete]);

    return (
        <>
            <Overlay isVisible={loading}/>
            <CardStyles className={isPinned ? 'pinned' : ''}>
                <CardHeader loading={loading}
                            note={{...note, isPinned: isPinned}}
                            onTogglePin={handleTogglePin}
                            onDelete={handleDelete}
                />
                <CardContent note={note}/>
                {/*<NoteTags tags={note.tags}/>*/}
            </CardStyles>
        </>
    )
});

export default React.memo(NoteCard);
