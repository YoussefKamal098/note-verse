import React from 'react';
import styled from 'styled-components';
import {SiSocketdotio} from 'react-icons/si';

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 20px;
    gap: 15px;
    font-size: 1em;
    font-weight: 600;
    color: var(--color-placeholder);

    p {
        font-size: 0.75em;
    }
`;

const LiveUpdatesEmptyState = () => (
    <Wrapper>
        <SiSocketdotio size={48}/>
        <h3>No live updates right now</h3>
        <p>This panel shows changes from collaborators as they happen while you're viewing this note.</p>
        <p>When others make changes while online, they'll appear here.</p>
    </Wrapper>
);

export default React.memo(LiveUpdatesEmptyState);
