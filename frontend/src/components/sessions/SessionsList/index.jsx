import React from "react";
import PropTypes from "prop-types";
import SessionItem from "../SessionItem";
import {SessionsListContainer, Message} from "./styles";

const SessionsList = ({sessions, onRevoke, currentSessionId, emptyMessage = "No sessions found"}) => {
    if (sessions.length === 0) {
        return <Message>{emptyMessage}</Message>;
    }

    return (
        <SessionsListContainer>
            {sessions.map(session => (
                <SessionItem
                    key={session.id}
                    session={session}
                    onRevoke={onRevoke}
                    isCurrent={session.id === currentSessionId}
                />
            ))}
        </SessionsListContainer>
    );
};

SessionsList.propTypes = {
    sessions: PropTypes.array.isRequired,
    onRevoke: PropTypes.func,
    currentSessionId: PropTypes.string,
    emptyMessage: PropTypes.string
};

export default SessionsList;
