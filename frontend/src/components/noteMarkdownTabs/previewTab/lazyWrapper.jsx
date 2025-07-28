import React from 'react';
import useLazyVisible from "@/hooks/useLazyVisible";

export const lazyWrapper = (Tag, options = {}) => {
    const {margin} = options;

    return function WrapperComponent({node, children, ...props}) {
        const [ref, visible] = useLazyVisible(margin);

        if (!visible) {
            return <div ref={ref} style={{height: "20px"}}/>;
        }

        return (
            <Tag {...props}>
                {children}
            </Tag>
        );
    };
};
