import React, {useState} from "react";
import {FaLink} from "react-icons/fa";
import PinButton from "../buttons/PinButton";
import DeleteButton from "../buttons/DeleteButton";
import Overlay from "../common/Overlay";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {POPUP_TYPE} from "../confirmationPopup/ConfirmationPopup";
import {
    CreatedAt,
    ItemContainerStyled,
    TagsContainerStyled,
    TagStyled,
    TitleLinkStyled,
    TitleStyled
} from "./NotesListStyles";
import RoutesPaths from "../../constants/RoutesPaths";
import {formatDate} from "shared-utils/date.utils";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import useNoteActions from "../../hooks/useNoteActions";

const NoteItem = React.memo(({
                                 index = 0,
                                 note = {},
                                 togglePin = () => ({}),
                                 onDelete = () => ({}),
                                 fetchReplacedNote = async () => ({})
                             }) => {
    const {notify} = useToastNotification();
    const [isPinned, setIsPinned] = useState(note.isPinned);
    const [loading, setLoading] = useState(false);
    const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
    const [pinButtonLoading, setPinButtonLoading] = useState(false);
    const {handleSave, handleDelete: handleNoteDelete} = useNoteActions(note);
    const {showConfirmation} = useConfirmation();

    const handleDelete = (noteId) => {
        setDeleteButtonLoading(true);
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to delete this note?",
            onConfirm: () => deleteNote(noteId),
            onCancel: () => setDeleteButtonLoading(false),
        });
    }

    const handleTogglePin = async (noteId) => {
        try {
            setLoading(true);
            setPinButtonLoading(true);
            await handleSave(note.id, {isPinned: !note.isPinned})
            setIsPinned(!isPinned);
            togglePin(noteId);
        } catch (error) {
            notify.error(`Failed to ${isPinned ? "unpin" : "pin"} the note:  ${error.message}`);
        } finally {
            setLoading(false);
            setPinButtonLoading(false);
        }
    };

    const deleteNote = async (noteId) => {
        try {
            setLoading(true);
            setDeleteButtonLoading(true);
            const replacedNote = await fetchReplacedNote();
            await handleNoteDelete(note);
            onDelete(noteId, replacedNote);
        } catch (error) {
            notify.error(`Deleting note Error:  ${error.message}`);
        } finally {
            setLoading(false);
            setDeleteButtonLoading(false);
        }
    };

    return (
        <>
            <Overlay isVisible={loading}/>
            <ItemContainerStyled loading={loading ? "true" : undefined} index={index}>
                <div className="left">
                    <TitleLinkStyled to={RoutesPaths.NOTE(note.id)}>
                        <TitleStyled> {note.title} </TitleStyled>
                        <FaLink className="icon"/>
                    </TitleLinkStyled>
                    <CreatedAt>{formatDate(note.createdAt)}</CreatedAt>
                </div>
                <div className="right">
                    <TagsContainerStyled>
                        {note.tags.map((tag, index) => (
                            <TagStyled key={`tag-${index}${note.id}`}><span> # </span>{tag}</TagStyled>
                        ))}
                    </TagsContainerStyled>
                    <div className="controllers">
                        <PinButton isPinned={isPinned} loading={pinButtonLoading}
                                   togglePin={() => handleTogglePin(note.id)}
                        />
                        <DeleteButton loading={deleteButtonLoading} onClick={() => handleDelete(note.id)}/>
                    </div>
                </div>
            </ItemContainerStyled>
        </>
    );
});

export default NoteItem;
