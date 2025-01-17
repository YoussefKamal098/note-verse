import React, {useState} from "react";
import {Link} from "react-router-dom";
import {toast} from "react-toastify";
import PinButton from "../buttons/PinButton";
import DeleteButton from "../buttons/DeleteButton";
import Overlay from "../common/Overlay";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {CardContainerStyled, CreatedAt, TagsContainerStyled, TagStyled, TitleStyled} from "./NoteCardStyles";
import noteService from "../../api/noteService";
import {formatDate} from "shared-utils/date.utils";

const NoteCard = React.memo(({
                                 index = 0,
                                 note = {},
                                 togglePin = () => ({}),
                                 onDelete = () => ({}),
                                 fetchReplacedNote = async () => ({})
                             }) => {
    const [isPinned, setIsPinned] = useState(note.isPinned);
    const [loading, setLoading] = useState(false);
    const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
    const [pinButtonLoading, setPinButtonLoading] = useState(false);
    const {showConfirmation} = useConfirmation();

    const handleDelete = (noteId) => {
        setDeleteButtonLoading(true);
        showConfirmation({
            type: "danger",
            confirmationMessage: "Are you sure you want to delete this note?",
            onConfirm: () => deleteNote(noteId),
            onCancel: () => setDeleteButtonLoading(false),
        });
    }

    const handleTogglePin = async (noteId) => {
        try {
            setLoading(true);
            setPinButtonLoading(true);
            await noteService.updateAuthenticatedUserNoteById(noteId, {isPinned: !note.isPinned});
            setIsPinned(!isPinned);
            togglePin(noteId);
        } catch (error) {
            toast.error(`Error toggling pin:  ${error.message}`);
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
            await noteService.deleteAuthenticatedUserNoteById(noteId);
            onDelete(noteId, replacedNote);
        } catch (error) {
            toast.error(`Error deleting note:  ${error.message}`);
        } finally {
            setLoading(false);
            setDeleteButtonLoading(false);
        }
    };

    return (
        <>
            <Overlay isVisible={loading}/>
            <CardContainerStyled loading={loading ? "true" : undefined} index={index}>
                <div className="left">
                    <Link style={{textDecoration: "none"}} to={`/note/${note.id}`}>
                        <TitleStyled>{note.title}</TitleStyled>
                    </Link>
                    <CreatedAt>{formatDate(note.createdAt)}</CreatedAt>
                </div>
                <div className="right">
                    <TagsContainerStyled>
                        {note.tags.map((tag, index) => (
                            <TagStyled key={`tag-${index}${note.id}`}><span> # </span>{tag}</TagStyled>
                        ))}
                    </TagsContainerStyled>
                    <div className="controllers">
                        <PinButton isPinned={isPinned} loading={pinButtonLoading} togglePin={() => {
                            handleTogglePin(note.id)
                        }}/>
                        <DeleteButton loading={deleteButtonLoading} onClick={() => {
                            handleDelete(note.id)
                        }}/>
                    </div>
                </div>
            </CardContainerStyled>
        </>
    );
});

export default NoteCard;
