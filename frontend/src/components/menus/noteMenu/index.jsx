import React, {useMemo} from "react";
import {MdDeleteForever} from "react-icons/md";
import {LuPencilLine} from "react-icons/lu";
import {FaLink} from "react-icons/fa6";
import {BsPersonFillAdd} from "react-icons/bs";
import {RiPushpin2Fill, RiUnpinLine} from "react-icons/ri";
import {IconButton} from '@mui/material';
import {MoreVert} from '@mui/icons-material';
import Menu from "..";

const NoteMenu = ({
                      onDelete,
                      onTogglePin,
                      onEdit,
                      onCopyLink,
                      onShowShare,
                      isPinned,
                  }) => {
    const menuOptions = useMemo(() => ([
        {
            text: isPinned ? "Unpin note" : "Pin note",
            icon: isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>,
            action: onTogglePin,
            disabled: !onTogglePin
        },
        {
            text: "Delete Note",
            icon: <MdDeleteForever/>,
            action: onDelete,
            danger: true,
            disabled: !onDelete
        },
        {
            text: "Edit",
            icon: <LuPencilLine/>,
            action: onEdit,
            disabled: !onEdit
        }, {
            text: "Copy Link",
            icon: <FaLink/>,
            action: onCopyLink,
            disabled: !onCopyLink
        },
        {
            text: "Share",
            icon: <BsPersonFillAdd/>,
            action: onShowShare,
            disabled: !onShowShare
        },

    ].filter(option => !option.disabled)), [
        onDelete,
        onTogglePin,
        onEdit,
        onCopyLink,
        onShowShare,
        isPinned
    ]);

    return (
        <Menu options={menuOptions}
              triggerIcon={
                  <IconButton aria-label="settings" sx={{color: 'var(--color-text)'}}>
                      <MoreVert/>
                  </IconButton>
              }
        />
    );
};

export default React.memo(NoteMenu);
