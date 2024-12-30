import React, { useState } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils";
import PinButton from "../buttons/PinButton";
import DeleteButton from "../buttons/DeleteButton";
import { TitleStyled, CreatedAt, TagsContainerStyled, TagStyled, CardContainerStyled } from "./NoteCardStyles";

const NoteCard =  React.memo(({ note, index, togglePin, onDelete }) => {
    const [isPinned, setIsPinned] = useState(note.isPinned);

    return (
        <CardContainerStyled index={index}>
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
                <PinButton isPinned={isPinned} togglePin={() => { setIsPinned(!isPinned); togglePin(); }} />
                <DeleteButton onClick={() => { onDelete(); }} />
            </div>
        </CardContainerStyled>
    );
});

export default NoteCard;
