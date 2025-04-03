import {useCallback, useState} from 'react';

const useImageProcessor = ({
                               targetWidth = 512,
                               quality = 0.85,
                               outputType = 'image/webp'
                           } = {}) => {

    const [isProcessing, setIsProcessing] = useState(false);

    const processImage = useCallback(async (canvas) => {
        setIsProcessing(true);

        try {
            const targetHeight = (canvas.height / canvas.width) * targetWidth;
            const offscreenCanvas = new OffscreenCanvas(targetWidth, targetHeight);
            const ctx = offscreenCanvas.getContext('2d');

            ctx.drawImage(canvas, 0, 0, targetWidth, targetHeight);

            return await offscreenCanvas.convertToBlob({
                type: outputType,
                quality
            });
        } finally {
            setIsProcessing(false);
        }
    }, [targetWidth, quality, outputType]);

    return {
        isProcessing,
        processImage
    };
};

export default useImageProcessor;
