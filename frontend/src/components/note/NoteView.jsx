import React from 'react';
import Contributors from "./Contributors";
import MainContent from "@/components/note/MainContent";
import SharePopUp from "@/components/noteSharePopUp";
import CommitHistory from "@/components/infiniteScrollListsPopUp/CommitHistory";
import Contributor from "@/components/infiniteScrollListsPopUp/Contributor";
import UserContributionHistory from "@/components/infiniteScrollListsPopUp/UserContributionHistory";
import CommitMessagePopup from "@/components/commitMessagePopup";
import RealTimeUpdatePanel from './realTimeUpdatePanel';

/**
 * Presentation component for Note that renders all sub-components
 *
 * @component
 * @param {Object} props
 * @param {Object} props.headerActions - Actions for the note header
 * @param {boolean} props.isMobile - Whether the device is mobile
 * @param {Object} props.markdownTabsRef - Ref to markdown tabs component
 * @param {Function} props.onContributorClick - Handler for contributor clicks
 * @param {Object} props.popups - Popup states
 * @param {Object} props.realTimeUpdatesPanel - Real-time updates panel controls
 * @param {Object} props.noteData - Note data properties
 * @param {Object} props.handlers - Various event handlers
 */
const NoteView = ({
                      headerActions,
                      isMobile,
                      markdownTabsRef,
                      onContributorClick,
                      popups,
                      realTimeUpdatesPanel,
                      noteData,
                      handlers
                  }) => {
    const {
        id,
        isPublic,
        owner,
        isOwner,
        isNew
    } = noteData;

    const {
        onVisibilityChange,
        handleCommitClick,
        handleOnCommitSave,
        handleOnPull,
        closePopup,
        handleContributorClick
    } = handlers;

    return (
        <>
            <Contributors onContributorClick={onContributorClick}/>
            <MainContent
                headerActions={headerActions}
                markdownTabsRef={markdownTabsRef}
            />

            {isOwner && (
                <SharePopUp
                    noteMeta={{id, isPublic}}
                    onClose={() => closePopup('share')}
                    onVisibilityChange={onVisibilityChange}
                    show={popups.share.open}
                />
            )}

            <CommitHistory
                noteId={id}
                noteOwnerId={owner.id}
                isOpen={popups.commitHistory.open}
                onItemClick={handleCommitClick}
                onClose={() => closePopup('commitHistory')}
            />

            <Contributor
                noteId={id}
                noteOwnerId={owner.id}
                isOpen={popups.contributors.open}
                onItemClick={handleContributorClick}
                onClose={() => closePopup('contributors')}
            />

            <UserContributionHistory
                noteId={id}
                userId={popups.userContributionHistory.data.userId}
                noteOwnerId={owner.id}
                isOpen={popups.userContributionHistory.open}
                onItemClick={handleCommitClick}
                onClose={() => closePopup('userContributionHistory')}
            />

            <CommitMessagePopup
                isOpen={popups.commitMessage.open}
                onClose={() => closePopup('commitMessage')}
                onSave={handleOnCommitSave}
            />

            {!isNew && !isMobile && (
                <RealTimeUpdatePanel
                    show={realTimeUpdatesPanel.show}
                    onPull={handleOnPull}
                    onClose={realTimeUpdatesPanel.close}
                    isMobile={isMobile}
                />
            )}
        </>
    );
};

export default React.memo(NoteView);
