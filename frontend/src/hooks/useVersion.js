import {useState, useCallback, useRef} from 'react';
import userService from '@/api/userService';
import versionService from '@/api/versionService';
import useRequestManager from './useRequestManager';
import {API_CLIENT_ERROR_CODES} from "@/api/apiClient";

/**
 * Hook to fetch version and its creator user
 * @param {string} versionId - The ID of the version to fetch
 * @param {boolean} initLoading - Initial loading state
 * @returns {{
 *   version: Object | null,
 *   createdByUser: Object | null,
 *   loading: boolean,
 *   error: Error | null,
 *   fetch: () => void
 * }}
 */
const useVersion = (versionId, initLoading = true) => {
    const [version, setVersion] = useState(null);
    const [createdByUser, setCreatedByUser] = useState(null);
    const [loading, setLoading] = useState(initLoading);
    const [error, setError] = useState(null);

    const {createAbortController, removeAbortController} = useRequestManager();

    const versionCtrlRef = useRef(null);
    const userCtrlRef = useRef(null);
    const contentCtrlRef = useRef(null);

    const fetchVersionAndUser = useCallback(async () => {
        if (!versionId) return;

        versionCtrlRef.current?.abort();
        userCtrlRef.current?.abort();

        const versionCtrl = createAbortController();
        const userCtrl = createAbortController();

        versionCtrlRef.current = versionCtrl;
        userCtrlRef.current = userCtrl;

        setLoading(true);
        setError(null);

        try {
            const versionRes = await versionService.getVersion(versionId, {signal: versionCtrl.signal});
            const versionData = versionRes.data;
            setVersion(versionData);

            const userRes = await userService.getUser({id: versionData.createdBy}, {signal: userCtrl.signal});
            setCreatedByUser(userRes.data);
            setLoading(false);
        } catch (err) {
            if (err?.code === API_CLIENT_ERROR_CODES.ERR_CANCELED) return;
            console.error("[useVersion] fetchVersionAndUser error:", err);
            setError(err?.message || "Failed to fetch version");
            setLoading(false);
        } finally {
            removeAbortController(versionCtrl);
            removeAbortController(userCtrl);
            versionCtrlRef.current = null;
            userCtrlRef.current = null;
        }
    }, [versionId, createAbortController, removeAbortController]);

    const fetchVersionContent = useCallback(async () => {
        if (!versionId) return;

        contentCtrlRef.current?.abort();
        const contentCtrl = createAbortController();
        contentCtrlRef.current = contentCtrl;

        setLoading(true);
        setError(null);

        try {
            const versionContentRes = await versionService.getVersionContent(versionId, {signal: contentCtrl.signal});
            const content = versionContentRes.data.content;
            setLoading(false);
            return content
        } catch (err) {
            if (err?.code === API_CLIENT_ERROR_CODES.ERR_CANCELED) return;
            console.error("[useVersion] fetchVersionContent error:", err);
            setError(err?.message || "Failed to fetch version content");
            setLoading(false);
        } finally {
            removeAbortController(contentCtrl);
            contentCtrlRef.current = null;
        }
    }, [versionId, createAbortController, removeAbortController]);

    return {
        version,
        createdByUser,
        loading,
        error,
        fetchContent: fetchVersionContent,
        fetch: fetchVersionAndUser,
    };
};

export default useVersion;
