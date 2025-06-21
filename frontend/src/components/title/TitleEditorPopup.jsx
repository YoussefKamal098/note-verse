import React, {useEffect, useState} from "react";
import EditPopUp from "../editPopUp/EditPopUp";
import useNoteValidation from "../../hooks/useNoteValidation";
import TitleInput from "./TitleInput";

const TitleEditorPopup = ({title, onSave, children}) => {
    const {validateTitle} = useNoteValidation();
    const [editedTitle, setEditedTitle] = useState(title);

    const onPopupSave = () => {
        if (validateTitle(editedTitle)) {
            onSave(editedTitle);
        }
    };

    useEffect(() => {
        setEditedTitle(title);
    }, [title]);

    return (
        <EditPopUp
            title={"Edit Title"}
            onSave={onPopupSave}
            openElement={children}
        >
            <TitleInput title={editedTitle} setTitle={setEditedTitle}/>
        </EditPopUp>
    );
}

export default React.memo(TitleEditorPopup);
