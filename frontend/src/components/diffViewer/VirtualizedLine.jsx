import React from 'react';
import useLazyVisible from '@/hooks/useLazyVisible';

const VirtualizedLine = ({children, lineHeight = 20, margin = 100, scrollContainer}) => {
    const [ref, isVisible] = useLazyVisible(margin, scrollContainer);

    // If not visible yet, render only a placeholder div
    if (!isVisible) {
        return <div ref={ref} style={{height: `${lineHeight}px`}}/>;
    }

    // Once visible, render the actual content (Line)
    return <>{children}</>;
};

export default React.memo(VirtualizedLine);
