import React, {useMemo} from 'react';
import Line from './Line';
import SplitView from './SplitView';

/**
 * Performance Optimization Notes:
 *
 * 1. For large diffs (100+ lines), consider implementing:
 *    - Virtualization using react-window
 *    - Memoization of line components
 *    - Lazy loading of non-visible content
 *
 * 2. Current limitations:
 *    - Renders all lines at once (inefficient for large hunks)
 *    - No windowing/scrolling optimizations
 *    - May lag with very large diffs
 *
 * 3. React-Window benefits:
 *    - Only renders visible lines
 *    - Maintains scroll position
 *    - Handles large datasets efficiently
 */

const Hunk = React.memo(({hunk, viewType, showWordDiff, filePath, darkMode}) => {
    const changesWithNumbers = useMemo(() => {
        let oldLine = hunk.oldStart;
        let newLine = hunk.newStart;

        return hunk.changes.map(change => {
            const line = {
                ...change,
                oldLine: change.type === 'insert' ? null : oldLine,
                newLine: change.type === 'delete' ? null : newLine
            };

            if (change.type !== 'insert') oldLine++;
            if (change.type !== 'delete') newLine++;

            return line;
        });
    }, [hunk]);

    return (
        <div className="diff-viewer-hunk">
            {viewType === 'unified' ? (
                <div className="diff-viewer-changes">
                    {changesWithNumbers.map((line, index) => (
                        <Line
                            key={index}
                            line={line}
                            lineLang={line.lineLang}
                            isComment={line.isComment}
                            showWordDiff={showWordDiff}
                            nextLine={index < hunk.changes.length - 1 ? changesWithNumbers[index + 1] : null}
                            prevLine={index > 0 ? changesWithNumbers[index - 1] : null}
                            filePath={filePath}
                            darkMode={darkMode}
                        />
                    ))}
                </div>
            ) : (
                <SplitView
                    changes={changesWithNumbers}
                    showWordDiff={showWordDiff}
                    filePath={filePath}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
});

export default Hunk;
