import React from "react";
import styled from "styled-components";

/** Helper: decide grid template based on contributors */
const getGridTemplate = (showContributors) =>
    showContributors
        ? `
      "contributors realtime_updates_panel"
      "main_content realtime_updates_panel"
      "main_content realtime_updates_panel"
    `
        : `"main_content realtime_updates_panel"`;

/**
 * Grid layout container for Note component
 *
 * @component
 * @param {Object} props
 * @param {boolean} props.showContributors - Whether to show contributors section
 * @param {boolean} props.showRealTimeUpdatesPanel - Whether to show real-time updates panel
 * @param {boolean} props.isMobile - Whether the device is mobile
 * @param {React.ReactNode} props.children - Child components to render
 */
const GridContainer = styled.div`
    display: grid;
    grid-template-areas: ${({$showContributors}) => getGridTemplate($showContributors)};
    grid-template-columns: 1fr auto;
    gap: 10px;
    width: 100%;
    ${({$isMobile}) => $isMobile && "max-width: 775px"};
    ${({$isMobile, $showRealTimeUpdatesPanel}) =>
            !$showRealTimeUpdatesPanel && !$isMobile && "max-width: 900px"};
    align-items: start;
`;

/**
 * Layout component for Note that handles responsive grid layout
 *
 * @component
 * @example
 * <NoteLayout showContributors={true} showRealTimeUpdatesPanel={false} isMobile={false}>
 *   <NoteContent />
 * </NoteLayout>
 */
const NoteLayout = ({showContributors, showRealTimeUpdatesPanel, isMobile, children}) => (
    <GridContainer
        $showContributors={showContributors}
        $showRealTimeUpdatesPanel={showRealTimeUpdatesPanel}
        $isMobile={isMobile}
    >
        {children}
    </GridContainer>
);

export default NoteLayout;
