import {roles} from "../../../constants/roles";

export const NEW_NOTE_KEY = 'new_note';

export const NOTE_STATUS = {
    editMode: false,
    initLoading: true,
    isLoading: false,
    isNew: false,
    error: null
};

export const DEFAULT_CONTENT = {
    title: '',
    content: '',
    tags: []
};

export const INIT_STATE = {
    id: null,
    createdAt: null,
    isPinned: false,
    isPublic: false,
    owner: {
        id: null,
        email: null,
        firstName: null,
        lastName: null,
    },
    userRole: roles.OWNER,
    originalContent: DEFAULT_CONTENT,
    currentContent: DEFAULT_CONTENT,
    status: NOTE_STATUS
};
