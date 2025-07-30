import React from 'react';
import styled from 'styled-components';
import CommitListItem from './CommitListItem';
import {AnimatedListWidthChildrenFade} from "@/components/animations/ContainerAnimation";

const Wrapper = styled.div`
    width: 100%;
    max-height: ${({$isMobile}) => $isMobile ? "90%" : "400px"};
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 10px;
`;

const CommitList = ({noteOwnerId, commits, onCommitClick, isMobile}) => (
    <Wrapper $isMobile={isMobile}>
        <AnimatedListWidthChildrenFade>
            {commits.map((versionId) => (
                <CommitListItem
                    key={versionId}
                    noteOwnerId={noteOwnerId}
                    versionId={versionId}
                    onClick={onCommitClick}
                />
            ))}
        </AnimatedListWidthChildrenFade>
    </Wrapper>
);

export default React.memo(CommitList);
