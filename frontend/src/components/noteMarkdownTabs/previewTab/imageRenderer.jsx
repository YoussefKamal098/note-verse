import React from 'react';
import {motion} from 'framer-motion';
import useLazyVisible from "@/hooks/useLazyVisible";

export const ImageRenderer = ({src, alt}) => {
    const [ref, visible] = useLazyVisible();

    return (
        <span ref={ref}>
            {visible && (
                <motion.img
                    loading="lazy"
                    src={src}
                    alt={alt}
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{duration: 0.4}}
                    style={{
                        backgroundColor: 'transparent',
                        borderRadius: '10px',
                        maxWidth: '100%',
                        height: 'auto',
                        display: 'block',
                        fontWeight: "bold"
                    }}
                />
            )}
        </span>
    );
};
