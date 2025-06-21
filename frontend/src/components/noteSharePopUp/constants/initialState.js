import {roles} from "../../../constants/roles";

export const INIT_STATE = {
    noteId: null,
    isPublic: false,
    collaborators: new Map(),
    suggestions: [],
    newCollaborators: new Map(),
    removedCollaborators: new Set(),
    updatedCollaborators: new Map(),
    newCollaboratorsRole: roles.VIEWER,
    notifyNewCollaborators: true,
    newCollaboratorsMessage: '',
    isLoading: false,
    initLoading: true,
    error: null,
};
