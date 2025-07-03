import React, {useRef} from 'react';
import styled from 'styled-components';
import CollapsibleSections from '@/components/collapsibleSections';
import Hunk from './Hunk';

const HeaderText = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`

const DeletionCount = styled.span`
    font-size: 1.15em;
    color: var(--diff-viewer-delete-text);
`;

const AdditionCount = styled.span`
    font-size: 1.15em;
    color: var(--diff-viewer-insert-text);
`;

const countChanges = (changes) => {
    let additions = 0;
    let deletions = 0;

    changes.forEach(change => {
        if (change.type === 'insert') additions++;
        if (change.type === 'delete') deletions++;
    });

    return {additions, deletions};
};

const FileDiff = ({file, viewType, showWordDiff, darkMode}) => {
    const fileRef = useRef(null);

    // Prepare sections data with calculated changes
    const sections = file.hunks.map((hunk, index) => {
        const {additions, deletions} = countChanges(hunk.changes);
        return {
            ...hunk,
            additions,
            deletions,
            id: `${file.oldPath}-${file.newPath}-${hunk.startLine}`,
            index
        };
    });

    return (
        <div className="diff-viewer-file-diff" ref={fileRef}>
            <CollapsibleSections
                theme={darkMode ? "dark" : "light"}
                sections={sections}
                initialCollapsed={[]}
                renderHeaderText={(hunk) =>
                    <HeaderText>
                        @@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@,
                        <DeletionCount>-{hunk.deletions}</DeletionCount>
                        <AdditionCount>+{hunk.additions}</AdditionCount>
                        lines changed
                    </HeaderText>
                }
                renderContent={(hunk) => (
                    <Hunk
                        hunk={hunk}
                        viewType={viewType}
                        showWordDiff={showWordDiff}
                        filePath={file.newPath || file.oldPath}
                        darkMode={darkMode}
                    />
                )}
            />
        </div>
    );
};

export default FileDiff;
