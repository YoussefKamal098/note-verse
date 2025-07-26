import {useEffect, useState, useCallback} from "react";
import userService from "@/api/userService";
import {API_CLIENT_ERROR_CODES} from "@/api/apiClient";
import useRequestManager from "@/hooks/useRequestManager";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {useConfirmation} from "@/contexts/ConfirmationContext";
import {POPUP_TYPE} from "@/components/confirmationPopup/ConfirmationPopup";

const useUserSessions = () => {
    const [activeSessions, setActiveSessions] = useState([]);
    const [inactiveSessions, setInactiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const {notify} = useToastNotification();
    const {showConfirmation} = useConfirmation();
    const {createAbortController, removeAbortController} = useRequestManager();

    const fetchSessions = useCallback(() => {
        const controller = createAbortController();

        const load = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await userService.getUserSessions("me", {signal: controller.signal});
                const now = new Date();

                setActiveSessions(response.data.filter(session => new Date(session.expiredAt) > now));
                setInactiveSessions(response.data.filter(session => new Date(session.expiredAt) <= now));
                setLoading(false);
            } catch (err) {
                if (err.code === API_CLIENT_ERROR_CODES.ERR_CANCELED) return;// ✅ avoid showing error for cancellation

                setLoading(false);
                notify.error(err?.message || "Error fetching sessions.");
                setError("Failed to load sessions. Please refresh the page or check your connection.");
            } finally {
                removeAbortController(controller);
            }
        };

        load();
    }, [createAbortController, removeAbortController, notify]);

    const revokeSession = useCallback(async (sessionId) => {
        try {
            setActiveSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? {...session, isRevoked: true} : session
                )
            );

            await userService.revokeUserSession("me", sessionId);
            notify.success("Session revoked successfully");
        } catch (err) {
            setActiveSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? {...session, isRevoked: false} : session
                )
            );
            notify.error("Session revoke failed");
        }
    }, [notify]);

    const onRevokeSession = useCallback(async (sessionId) => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to revoke this session?",
            onConfirm: () => revokeSession(sessionId),
        });
    }, [showConfirmation, revokeSession]);

    useEffect(() => {
        fetchSessions();
    }, [fetchSessions]);

    return {
        activeSessions,
        inactiveSessions,
        loading,
        error,
        revokeSession: onRevokeSession,
    };
};

export default useUserSessions;
