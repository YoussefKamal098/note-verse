import React from 'react';
import styled from 'styled-components';
import {IoGitCommit} from "react-icons/io5";

const CommitMessageContainer = styled.div`
    background: var(--color-background-primary);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
    padding: 0 0 15px;
`;

const CommitHeader = styled.div`
    font-size: 1em;
    font-weight: bold;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 10px 10px 0;
`

const CommitIconStyles = styled(IoGitCommit)`
    font-size: 1.1em;
    font-weight: bold;
    color: var(--color-primary);
    margin-left: 5px;
`

const CommitMessageWrapper = styled.div`
    width: 100%;
    max-height: 200px;
    min-height: 60px;
    overflow: auto;
    padding: 5px 10px 5px 15px;
`

const CommitMessage = styled.div`
    font-size: 0.8em;
    color: var(--color-placeholder);
    font-weight: bold;
    word-break: break-all;
    text-wrap: wrap;
    width: 95%;
    max-width: 600px;
    height: 100%;
`

const CommitMessageComponent = ({message}) => {
    return (
        <CommitMessageContainer>
            <CommitHeader>
                <CommitIconStyles/> Commit Message
            </CommitHeader>
            <CommitMessageWrapper>
                <CommitMessage>
                    {`"${message}"`}
                </CommitMessage>
            </CommitMessageWrapper>
        </CommitMessageContainer>
    );
}

export default React.memo(CommitMessageComponent);
