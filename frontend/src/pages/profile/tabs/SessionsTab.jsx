import React, {useState, useEffect} from "react";
import {useOutletContext} from "react-router-dom";
import styled from "styled-components";
import {AnimatedTab} from "../animations";
import Loader from "@/components/common/Loader";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import SessionsList from "@/components/sessions/SessionsList";
import userService from "@/api/userService"
import {SectionTitle} from "../styles";
import {useAuth} from "@/contexts/AuthContext";
import useRequestManager from "@/hooks/useRequestManager";
import {API_CLIENT_ERROR_CODES} from "@/api/apiClient";

const SessionsContainer = styled.div`
    min-height: 400px;
    display: flex;
    flex-direction: column;
    gap: 2rem;
`;

const SessionsSection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const ErrorMessage = styled.div`
    padding: 20px;
    font-size: 0.9em;
    color: var(--color-danger);
    text-align: center;
    font-weight: 600;
`;

const SessionsTab = () => {
    const {key} = useOutletContext();
    const {sessionId: currentSessionId} = useAuth();
    const {notify} = useToastNotification();
    const {createAbortController, removeAbortController} = useRequestManager();
    const [activeSessions, setActiveSessions] = useState([]);
    const [inactiveSessions, setInactiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const controller = createAbortController();

        const fetchSessions = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await userService.getUserSessions("me", {signal: controller.signal});

                const data = response.data;
                const now = new Date();

                setActiveSessions(data.filter(session => new Date(session.expiredAt) > now));
                setInactiveSessions(data.filter(session => new Date(session.expiredAt) <= now));
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

        fetchSessions();
    }, [notify, createAbortController, removeAbortController]);


    const handleRevokeSession = async (sessionId) => {
        try {
            setActiveSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? {...session, isRevoked: true} : session
                )
            );

            await userService.revokeUserSession("me", sessionId);
            notify.success('Session revoked successfully');
        } catch (error) {
            setActiveSessions(prev =>
                prev.map(session =>
                    session.id === sessionId ? {...session, isRevoked: false} : session
                )
            );
            notify.error('Session revoke failed');
        }
    };

    return (
        <AnimatedTab key={key}>
            <SessionsContainer>
                {loading ? (
                    <Loader size={25} isAbsolute={true}/>
                ) : error ? (
                    <ErrorMessage>{error}</ErrorMessage>
                ) : (
                    <>
                        <SessionsSection>
                            <SectionTitle>
                                Active Sessions ({activeSessions.length})
                            </SectionTitle>
                            <SessionsList
                                sessions={activeSessions}
                                onRevoke={handleRevokeSession}
                                currentSessionId={currentSessionId}
                                emptyMessage={"You have no currently active sessions."}
                            />
                        </SessionsSection>

                        <SessionsSection>
                            <SectionTitle>
                                Inactive Sessions ({inactiveSessions.length})
                            </SectionTitle>
                            <SessionsList
                                sessions={inactiveSessions}
                                emptyMessage={"No recently expired or logged out sessions."}
                            />
                        </SessionsSection>
                    </>
                )}

            </SessionsContainer>
        </AnimatedTab>
    );
};

export default React.memo(SessionsTab);
