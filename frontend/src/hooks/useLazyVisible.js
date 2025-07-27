import {useEffect, useRef, useState} from 'react';

const useLazyVisible = (margin = '100px') => {
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
            {rootMargin: margin}
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [margin]);

    return [ref, visible];
};

export default useLazyVisible;
