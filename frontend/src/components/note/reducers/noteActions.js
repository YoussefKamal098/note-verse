import {roles} from "@/constants/roles";
import routesPaths from "@/constants/routesPaths";
import {API_CLIENT_ERROR_CODES} from '@/api/apiClient';
import noteService from '@/api/noteService';
import userService from '@/api/userService';
import cacheService from '@/services/cacheService';
import {ACTION_TYPES} from "../constants/actionTypes";
import {DEFAULT_CONTENT, NEW_NOTE_KEY} from "../constants/noteConstants";
import {getContentChanges} from "./noteReducer";

const normalizeContent = (str) => str.replace(/\s+$/, '') + '\n';

export const createNoteActions = (dispatch, getState, dependencies) => {
    const {navigate, notify, validateNote, requestManager, user} = dependencies;

    const getCacheKey = () => {
        const {id, status} = getState();
        return status.isNew ? NEW_NOTE_KEY : id;
    };

    const handleError = (error, redirectToErrorPage = false) => {
        if (error.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
            dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {error: error.message}});

            if (redirectToErrorPage) {
                navigate(routesPaths.ERROR, {state: {message: error.message}});
            } else {
                notify.error(error.message);
            }
        }
    };

    return {
        fetchNote: async (noteId) => {
            const controller = requestManager.createAbortController();

            try {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {initLoading: true}});

                const [cachedData, noteResult] = await Promise.all([
                    cacheService.get(noteId).catch(() => null),
                    noteService.getNoteById(noteId, {signal: controller.signal}),
                ]);

                const note = noteResult.data;
                const owner = (await userService.getUser({id: note.userId})).data;
                const noteContent = {
                    title: note.title,
                    content: note.content,
                    tags: [...note.tags]
                };

                let userRole;
                if (user?.id === note.userId) {
                    userRole = roles.OWNER;
                } else {
                    const result = await userService.getUserPermission(user?.id, {noteId}, {signal: controller.signal})
                    userRole = result.data.role;
                }

                const currentContent = {...noteContent, ...cachedData}

                dispatch({
                    type: ACTION_TYPES.NOTE.INIT,
                    payload: {
                        id: note.id,
                        createdAt: note.createdAt,
                        isPinned: note.isPinned,
                        isPublic: note.isPublic,
                        owner: {
                            id: owner.id,
                            avatarUrl: owner.avatarUrl,
                            firstname: owner.firstname,
                            lastname: owner.lastname,
                            email: owner.email
                        },
                        userRole: userRole,
                        currentContent: {
                            ...currentContent,
                            content: normalizeContent(currentContent.content),
                        },
                        originalContent: {
                            ...noteContent,
                            content: normalizeContent(noteContent.content),
                        },
                        status: {editMode: !!cachedData}
                    }
                });

                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {initLoading: false}});
            } catch (error) {
                handleError(error, true);
            } finally {
                requestManager.removeAbortController(controller);
            }
        },

        initializeNewNote: async () => {
            const cachedData = await cacheService.get(NEW_NOTE_KEY).catch(() => null);

            dispatch({
                type: ACTION_TYPES.NOTE.INIT_NEW,
                payload: {
                    owner: {
                        id: user.id,
                        email: user.email,
                        firstname: user.firstname,
                        lastname: user.lastname,
                        avatarUrl: user.avatarUrl
                    },
                    currentContent: {...DEFAULT_CONTENT, ...cachedData},
                    status: {isNew: true, editMode: true, initLoading: false}
                }
            });
        },

        updateContent: async (updates) => {
            const {originalContent, currentContent} = getState();
            const normalizedUpdates = {
                ...updates,
                content: normalizeContent((updates.content ?? currentContent.content)),
            }

            const newContent = {...currentContent, ...normalizedUpdates};
            const changes = getContentChanges(originalContent, newContent);

            dispatch({type: ACTION_TYPES.CONTENT.UPDATE_CURRENT, payload: normalizedUpdates});

            if (Object.keys(changes).length) {
                await cacheService.save(getCacheKey(), changes).catch(() => null);
            } else {
                await cacheService.delete(getCacheKey()).catch(() => null);
            }
        },

        persistNote: async ({commitMessage} = {}) => {
            const controller = requestManager.createAbortController();

            try {
                const {currentContent, originalContent, status, isPinned, isPublic} = getState();
                if (!validateNote(currentContent)) return;

                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: true}});

                const changes = getContentChanges(originalContent, currentContent);
                const result = status.isNew
                    ? await noteService.create(user?.id, {
                        ...currentContent,
                        isPinned,
                        isPublic
                    }, {signal: controller.signal})
                    : await noteService.updateNoteById({
                        noteId: getState().id,
                        ...(commitMessage ? {commitMessage} : {})
                    }, changes, {signal: controller.signal});

                const savedNote = result.data;

                dispatch({
                    type: ACTION_TYPES.CONTENT.SET_ORIGINAL, payload: {
                        title: savedNote.title,
                        content: savedNote.content,
                        tags: [...savedNote.tags],
                    }
                });
                await cacheService.delete(getCacheKey()).catch(() => null);

                if (status.isNew) {
                    navigate(routesPaths.NOTE(savedNote.id), {replace: true});
                }

                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {editMode: false}});
                notify.success(`Note ${status.isNew ? 'created' : 'updated'} successfully`);
            } catch (error) {
                handleError(error);
            } finally {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: false}});
                requestManager.removeAbortController(controller);
            }
        },

        deleteNote: async () => {
            const controller = requestManager.createAbortController();

            try {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: true}});
                await noteService.deleteNoteById(getState().id, {signal: controller.signal});
                await cacheService.delete(getState().id).catch(() => null);
                notify.success('Note deleted successfully');
                navigate(routesPaths.HOME);
            } catch (error) {
                handleError(error);
            } finally {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: false}});
                requestManager.removeAbortController(controller);
            }
        },

        discardChanges: async () => {
            await cacheService.delete(getCacheKey()).catch(() => null);
            dispatch({type: ACTION_TYPES.CONTENT.DISCARD_CHANGES});
            dispatch({type: ACTION_TYPES.STATUS.TOGGLE_EDIT_MODE});

            if (getState().status.isNew) {
                navigate(-1);
            }
        },

        resetContent: async (content) => {
            await cacheService.delete(getCacheKey()).catch(() => null);

            dispatch({
                type: ACTION_TYPES.CONTENT.RESET_CONTENT,
                payload: normalizeContent(content)
            });
        },

        togglePin: async () => {
            const controller = requestManager.createAbortController();
            try {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: true}});
                dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PIN});

                await noteService.updateNoteById({noteId: getState().id}, {isPinned: !getState().isPinned}, {signal: controller.signal});
                notify.success(`Note ${getState().isPinned ? 'unPinned' : 'pinned'} successfully`);
            } catch (error) {
                dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PIN});
                handleError(error);
            } finally {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: false}});
                requestManager.removeAbortController(controller);
            }
        },

        toggleVisibility: async () => {
            const controller = requestManager.createAbortController();
            try {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: true}});
                dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PUBLIC});

                await noteService.updateNoteById({noteId: getState().id}, {isPublic: !getState().isPublic}, {signal: controller.signal});
                notify.success(`Note ${getState().isPinned ? 'unPinned' : 'pinned'} successfully`);
            } catch (error) {
                dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PUBLIC});
                handleError(error);
            } finally {
                dispatch({type: ACTION_TYPES.STATUS.UPDATE, payload: {isLoading: false}});
                requestManager.removeAbortController(controller);
            }
        },

        /**
         * Toggle the local public/private state without API call
         * Use when you only need UI feedback before persisting
         */
        togglePinState: () => {
            dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PIN});
        },

        /**
         * Updates the local pin/unpin state without API call
         * Use when you only need UI feedback before persisting
         */
        updateVisibilityState: (visibility) => {
            dispatch({type: ACTION_TYPES.NOTE.UPDATE_PUBLIC, payload: visibility});
        },

        /**
         * Toggle the local public/private state without API call
         * Use when you only need UI feedback before persisting
         */
        toggleVisibilityState: () => {
            dispatch({type: ACTION_TYPES.NOTE.TOGGLE_PUBLIC});
        },

        toggleEditMode: () => dispatch({type: ACTION_TYPES.STATUS.TOGGLE_EDIT_MODE})
    };
};
