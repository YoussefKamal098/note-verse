export const VERSION_STATUS = {
    initLoading: true,
    isLoading: false,
    isFullContentLoading: true,
    error: null
};

export const INIT_STATE = {
    id: null,
    createdAt: null,
    commitMessage: '',
    patch: "",
    fullContent: "",
    user: {
        id: null,
        firstname: null,
        lastname: null,
        avatarUrl: null
    },
    isNoteOwner: false,
    status: VERSION_STATUS
};
