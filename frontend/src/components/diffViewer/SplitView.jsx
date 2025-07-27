import React from 'react';
import VirtualizedLine from './VirtualizedLine';
import Line from './Line';

const SplitView = React.memo(({changes, showWordDiff, containerRef, filePath, darkMode}) => (
    <div className="diff-viewer-split-changes">
        <div className="diff-viewer-old-file">
            {changes.map((line, index) => {
                if (line.type === 'insert') return null;

                return (
                    <VirtualizedLine key={index} scrollContainer={containerRef.current}>
                        <Line
                            line={line}
                            lineLang={line.lineLang}
                            isComment={line.isComment}
                            showWordDiff={showWordDiff}
                            nextLine={index < changes.length - 1 ? changes[index + 1] : null}
                            filePath={filePath}
                            darkMode={darkMode}
                        />
                    </VirtualizedLine>
                );
            })}
        </div>
        <div className="diff-viewer-new-file">
            {changes.map((line, index) => {
                if (line.type === 'delete') return null;

                return (
                    <VirtualizedLine key={index} scrollContainer={containerRef.current}>
                        <Line
                            line={line}
                            lineLang={line.lineLang}
                            isComment={line.isComment}
                            showWordDiff={showWordDiff}
                            prevLine={index > 0 ? changes[index - 1] : null}
                            filePath={filePath}
                            darkMode={darkMode}
                        />
                    </VirtualizedLine>
                );
            })}
        </div>
    </div>
));

export default SplitView;
