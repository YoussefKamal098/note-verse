import React from "react";
import {MdDeleteForever} from "react-icons/md";
import {BsDatabaseFillDown, BsDatabaseFillSlash} from "react-icons/bs";
import {RiPushpin2Fill, RiUnpinLine} from "react-icons/ri";
import Menu from "../Menu";

const NoteMenu = ({
                      onDelete,
                      onSave,
                      onDiscard,
                      onTogglePin,
                      isPinned,
                      disableSave,
                      disableDiscard,
                      disableDelete,
                  }) => {
    const menuOptions = [
        {
            text: isPinned ? "Unpin note" : "Pin note",
            icon: isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>,
            action: onTogglePin,
            danger: false,
            disabled: false
        },
        {
            text: "Commit Changes",
            icon: <BsDatabaseFillDown/>,
            action: onSave,
            danger: false,
            disabled: disableSave
        },
        {
            text: "Discard Changes",
            icon: <BsDatabaseFillSlash/>,
            action: onDiscard,
            danger: true,
            disabled: disableDiscard
        },
        {
            text: "Delete Note",
            icon: <MdDeleteForever/>,
            action: onDelete,
            danger: true,
            disabled: disableDelete
        }
    ].filter(option => !option.disabled); // Filter out disabled options

    return (
        <Menu options={menuOptions}/>
    );
};

export default React.memo(NoteMenu);
