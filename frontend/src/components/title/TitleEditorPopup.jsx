import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import React, {useEffect, useState} from "react";
import noteValidationSchema from "../../validations/noteValidtion";
import EditPopUp from "../editPopUp/EditPopUp";
import TitleInput from "./TitleInput";

const TitleEditorPopup = ({title, onSave, children}) => {
    const {notify} = useToastNotification();
    const [editedTitle, setEditedTitle] = useState(title);

    const onPopupSave = () => {
        try {
            noteValidationSchema.title.validateSync(editedTitle);
            onSave(editedTitle);
        } catch (error) {
            notify.warn(error.message);
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

export default TitleEditorPopup;
