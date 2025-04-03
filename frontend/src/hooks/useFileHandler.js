import {useCallback, useState} from 'react';
import {formatBytes} from 'shared-utils/string.utils';

const useFileHandler = ({
                            maxFileSize = 1024 * 1024, // 1MB
                            allowedMimeTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
                        } = {}) => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);

    const validateFile = useCallback((file) => {
        if (!allowedMimeTypes.includes(file.type)) {
            throw new Error(`Unsupported file type: ${file.type}`);
        }

        if (file.size > maxFileSize) {
            throw new Error(`File exceeds ${formatBytes(maxFileSize)} limit`);
        }
    }, [allowedMimeTypes, maxFileSize]);

    const handleFileChange = useCallback(async (event) => {
        try {
            const selectedFile = event.target.files?.[0];
            if (!selectedFile) return;

            validateFile(selectedFile);
            setFile(selectedFile);
            setError(null);
            return selectedFile;
        } catch (err) {
            setError(err.message);
        }
    }, [validateFile]);

    return {
        file,
        error,
        handleFileChange,
        resetFile: () => setFile(null)
    };
};

export default useFileHandler;
