import React, {useEffect, useState} from 'react';
import Pagination from "../pagination";
import FileDiff from './FileDiff';
import Toolbar from './Toolbar';
import {parseDiffText} from './DiffParser';
import './styles.css';

const DiffViewer = React.memo(({
                                   diffs,
                                   theme = "light",
                                   viewType = 'unified',
                                   showWordDiff = false,
                                   showToolbar = true,
                                   showHeader = true,
                                   showRenameNotation = false
                               }) => {
    const [state, setState] = useState({
        viewType: viewType,
        showWordDiff: showWordDiff,
        theme: theme,
        currentDiffIndex: 0,
        viewSize: "0.75",
        compactLineHeight: false
    });

    useEffect(() => {
        setState(prev => ({
            ...prev,
            theme: theme
        }));
    }, [theme, viewType, showWordDiff]);

    // Reset currentDiffIndex when diffs array changes
    useEffect(() => {
        setState(prev => ({
            ...prev,
            currentDiffIndex: 0
        }));
    }, [diffs]);


    const currentDiff = Array.isArray(diffs)
        ? diffs[state.currentDiffIndex]
        : diffs;


    if (!currentDiff?.diff) {
        return <div className="diff-viewer-error">No diff content provided</div>;
    }

    // Parse the diff
    const files = parseDiffText(currentDiff.diff);

    // Get the first file's paths to display in header (or fallback to currentDiff.name)
    const displayName = files.length > 0
        ? `${files[0].oldPath || 'unknown'} → ${files[0].newPath || 'unknown'}`
        : currentDiff.name;


    const updateState = (newState) => {
        setState(prev => ({...prev, ...newState}));
    };

    const handlePageChange = ({selected}) => {
        updateState({currentDiffIndex: selected});
    };

    return (
        <div className={`diff-viewer-container`}
             style={{
                 '--diff-viewer-font-size': `${state.viewSize}em`,
                 '--diff-viewer-line-height': state.compactLineHeight ? "1" : "1.5"
             }}
             data-diff-viewer-theme={state.theme}
        >
            {showHeader && <div className="diff-viewer-header">
                {showRenameNotation ?
                    <h2 className="diff-viewer-rename-notation-name">{displayName}</h2>
                    : <h2 className="diff-viewer-name">{currentDiff.name}</h2>}

                {Array.isArray(diffs) && diffs.length > 1 && (
                    <div className="diff-viewer-navigation">
                        <Pagination
                            totalPages={diffs.length}
                            currentPage={0}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>}

            {showToolbar && <Toolbar state={state} updateState={updateState}/>}

            {files.map((file, index) => (
                <FileDiff
                    key={index}
                    file={file}
                    viewType={state.viewType}
                    showWordDiff={state.showWordDiff}
                    darkMode={theme === "dark"}
                />
            ))}
        </div>
    );
});

export default DiffViewer;
