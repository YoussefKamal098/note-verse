import {MdOutlineSecurity} from "react-icons/md";
import {TbUserEdit} from "react-icons/tb";

export const NOTIFICATION_TYPES = {
    LOGIN: 'login',
    NOTE_UPDATE: 'note_update',
    USER_UPDATE: 'user_update'
};

export const NOTIFICATION_ICONS = {
    [NOTIFICATION_TYPES.LOGIN]: MdOutlineSecurity,
    [NOTIFICATION_TYPES.NOTE_UPDATE]: TbUserEdit
};

export const NOTIFICATION_TABS = {
    ALL: 'all',
    UNREAD: 'unread'
};

export const TABS = [
    {id: NOTIFICATION_TABS.ALL, label: 'All'},
    // {id: NOTIFICATION_TABS.UNREAD, label: 'Unread'}
];
