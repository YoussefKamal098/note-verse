import {ACTION_TYPES} from "../constants/actionTypes";
import noteService from "@/api/noteService";
import versionService from "@/api/versionService";
import userService from "@/api/userService";
import {API_CLIENT_ERROR_CODES} from "@/api/apiClient";
import routesPaths from "@/constants/routesPaths";

export const createVersionActions = (dispatch, getState, dependencies) => {
    const {notify, requestManager, navigate, user} = dependencies;

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
        fetchVersion: async (versionId) => {
            const controller = requestManager.createAbortController();

            try {
                dispatch({type: ACTION_TYPES.STATUS.INIT_LOADING, payload: true});

                const versionResult = await versionService.getVersion(versionId, {signal: controller.signal});
                const version = versionResult.data;

                const userResult = await userService.getUser({id: version.createdBy}, {signal: controller.signal});
                const versionUser = userResult.data;

                const noteResult = await noteService.getNoteById(version.noteId, {signal: controller.signal});
                const note = noteResult.data;

                dispatch({
                    type: ACTION_TYPES.VERSION.INIT,
                    payload: {
                        id: version.id,
                        createdAt: version.createdAt,
                        commitMessage: version.message,
                        patch: version.patch,
                        user: {
                            id: versionUser.id,
                            firstname: versionUser.firstname,
                            lastname: versionUser.lastname,
                            avatarUrl: versionUser.avatarUrl
                        },
                        isNoteOwner: user?.id === note.userId
                    }
                });

                dispatch({type: ACTION_TYPES.STATUS.INIT_LOADING, payload: false});
            } catch (error) {
                handleError(error, true);
            } finally {
                requestManager.removeAbortController(controller);
            }
        },

        restoreVersion: async () => {
            const controller = requestManager.createAbortController();

            try {
                const {id, isNoteOwner} = getState();
                if (!isNoteOwner) {
                    throw new Error("Only the owner can restore versions");
                }

                dispatch({type: ACTION_TYPES.STATUS.LOADING, payload: true});
                await versionService.restoreVersion(id, {signal: controller.signal});
                dispatch({type: ACTION_TYPES.STATUS.LOADING, payload: false});
                notify.success("Version restored successfully. The current note content is now identical to the selected version.");
            } catch (error) {
                dispatch({type: ACTION_TYPES.STATUS.LOADING, payload: false});
                handleError(error);
            } finally {

                requestManager.removeAbortController(controller);
            }
        },

        setFullContent: async () => {
            const {fullContent, id} = getState();
            const controller = requestManager.createAbortController();

            try {
                if (!fullContent) {
                    dispatch({type: ACTION_TYPES.STATUS.FULL_CONTENT_LOADING, payload: true});
                    const fullContentResult = await versionService.getVersionContent(id, {signal: controller.signal});
                    const fullContent = fullContentResult.data.content;
                    dispatch({type: ACTION_TYPES.VERSION.SET_FULL_CONTENT, payload: fullContent});
                    return fullContent;
                }
                return fullContent;
            } catch (error) {
                handleError(error);
            } finally {
                dispatch({type: ACTION_TYPES.STATUS.FULL_CONTENT_LOADING, payload: false});
                requestManager.removeAbortController(controller);
            }
        }
    };
};
