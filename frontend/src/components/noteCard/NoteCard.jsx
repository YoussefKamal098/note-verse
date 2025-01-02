import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDate } from "../../utils";
import PinButton from "../buttons/PinButton";
import DeleteButton from "../buttons/DeleteButton";
import Overlay from "../common/Overlay";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { TitleStyled, CreatedAt, TagsContainerStyled, TagStyled, CardContainerStyled } from "./NoteCardStyles";
import noteService from "../../api/noteService";

const NoteCard = React.memo(({ note, index, togglePin = () => {}, onDelete = () => {}, fetchReplacedNote = () => {} }) => {
    const [isPinned, setIsPinned] = useState(note.isPinned);
    const [loading, setLoading] = useState(false);
    const [deleteButtonLoading, setDeleteButtonLoading] = useState(false);
    const [pinButtonLoading, setPinButtonLoading] = useState(false);
    const { showConfirmation }  = useConfirmation();

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
            await noteService.update(noteId, { isPinned: !note.isPinned });
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
            await noteService.delete(noteId);
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
            <Overlay isVisible={loading} />
            <CardContainerStyled loading={loading ? "true" : undefined} index={index}>
                <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", maxWidth: "50%" }}>
                    <Link style={{ textDecoration: "none" }} to={`/note/${note.id}`}>
                        <TitleStyled>{note.title}</TitleStyled>
                    </Link>
                    <CreatedAt>{formatDate(note.createdAt)}</CreatedAt>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1em", maxWidth: "50%" }}>
                    <TagsContainerStyled>
                        {note.tags.map((tag, index) => (
                            <TagStyled key={`tag-${index}${note.id}`}><span> # </span>{tag}</TagStyled>
                        ))}
                    </TagsContainerStyled>
                    <PinButton isPinned={isPinned} loading={pinButtonLoading} togglePin={() => { handleTogglePin(note.id) }} />
                    <DeleteButton loading={deleteButtonLoading} onClick={ () => { handleDelete(note.id) }} />
                </div>
            </CardContainerStyled>
        </>
    );
});

export default NoteCard;
