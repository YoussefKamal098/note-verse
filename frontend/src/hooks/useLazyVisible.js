import {useEffect, useRef, useState} from 'react';

const useLazyVisible = (margin = 100, scrollContainer = null) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                root: scrollContainer,
                rootMargin: `${margin}px`
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [margin, ref, scrollContainer]);

    return [ref, visible];
};

export default useLazyVisible;
