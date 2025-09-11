import React from "react";
import {useOutletContext} from "react-router-dom";
import styled from "styled-components";
import {AnimatedTab} from "../animations";
import Loader from "@/components/common/Loader";
import SessionsList from "@/components/sessions/SessionsList";
import {SectionTitle} from "../styles";
import {useAuth} from "@/contexts/AuthContext";
import useUserSessions from "@/hooks/useUserSessions";

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
    
    const {
        activeSessions,
        inactiveSessions,
        loading,
        error,
        revokeSession
    } = useUserSessions();

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
                                onRevoke={revokeSession}
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
