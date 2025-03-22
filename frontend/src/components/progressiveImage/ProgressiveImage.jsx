import React, {useCallback, useState} from "react";

import {
    ProgressiveHighResStyled,
    ProgressiveImageWrapperStyled,
    ProgressivePlaceholderStyled,
    ProgressivePlaceholderWrapperStyled,
} from "./ProgressiveImageStyles";

const ProgressiveImage = ({src, alt, placeholderSrc}) => {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    return (
        <ProgressiveImageWrapperStyled>
            <ProgressivePlaceholderWrapperStyled>
                <ProgressivePlaceholderStyled
                    src={placeholderSrc || src}
                    alt={alt}
                    loading="lazy"
                    initial={{opacity: 1}}
                    animate={{opacity: isLoaded ? 0 : 1}}
                    transition={{duration: 0.5}}
                />
            </ProgressivePlaceholderWrapperStyled>
            <ProgressiveHighResStyled
                src={src}
                alt={alt}
                loading="lazy"
                initial={{opacity: 0}}
                animate={{opacity: isLoaded ? 1 : 0}}
                transition={{duration: 0.5}}
                onLoad={handleLoad}
            />
        </ProgressiveImageWrapperStyled>
    );
};

export default React.memo(ProgressiveImage);
