import React, {useCallback, useState} from 'react';
import styled from 'styled-components';
import {useTheme} from '@/contexts/ThemeContext';
import useCopyLink from "@/hooks/useCopyLink";
import DiffViewer from "@/components/diffViewer";
import PreviewPopupTap from "@/components/previewPopupTap";
import Header from "./Header";
import CommitMessage from "./CommitMessage";
import {useVersionContext, useVersionSelector} from "./hooks/useVersionContext";

const PageContainer = styled.div`
    background-color: var(--color-background);
    border-radius: 10px;
    padding: 15px 20px;
`;

const Version = () => {
    const {theme} = useTheme();
    const copyLink = useCopyLink();
    const {actions, selectors} = useVersionContext();
    const [fullContentOpen, setFullContentOpen] = useState(false);

    const version = useVersionSelector(selectors.getVersion);
    const fullContent = useVersionSelector(selectors.getFullContent);
    const isNoteOwner = useVersionSelector(selectors.isNoteOwner);
    const {isFullContentLoading} = useVersionSelector(selectors.getStatus);

    const handleRestoreVersion = useCallback(async () => {
        actions.restoreVersion();
    }, [actions.restoreVersion])

    const handleGetFullContent = useCallback(async () => {
        setFullContentOpen(true);
        await actions.setFullContent();
    }, [actions.setFullContent]);

    const headerActions = {
        onRestore: isNoteOwner ? handleRestoreVersion : null,
        onGetFullVersion: handleGetFullContent,
        onCopyLink: copyLink
    };

    return (
        <PageContainer>
            <PreviewPopupTap
                content={fullContent}
                isOpen={fullContentOpen}
                isLoading={isFullContentLoading}
                onClose={() => setFullContentOpen(false)}
            />
            <Header user={version.user} version={version} actions={headerActions}/>
            <CommitMessage message={version.commitMessage}/>
            <DiffViewer diffs={{diff: version.patch}} showHeader={false} theme={theme}/>
        </PageContainer>
    );
};

export default React.memo(Version);
