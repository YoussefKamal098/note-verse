import React, {useCallback, useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {FaCamera} from 'react-icons/fa';
import {useToastNotification} from '../../contexts/ToastNotificationsContext';
import useFileHandler from '../../hooks/useFileHandler';
import Avatar from '../common/Avatar';
import ProgressiveImage from '../progressiveImage/ProgressiveImage';
import ImageEditorModal from './ImageEditorModal';
import UploadLoader from './UploadLoader';
import Overlay from '../common/Overlay';

import {
    ContainerStyled,
    EditButtonStyled,
    HiddenInputStyled,
    ProfileImageContainerStyled
} from './ProfileImageUploaderStyles';

const ProfileImageUploader = ({
                                  onSaveImage,
                                  imageUrl,
                                  maxFileSize = 1024 * 1024, // 1MB default
                                  allowedMimeTypes = ['image/png', 'image/jpeg', "image/jpg", 'image/webp']
                              }) => {
    const {notify} = useToastNotification();
    const [savedImageUrl, setSavedImageUrl] = useState(imageUrl);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const {
        file: editingImage,
        error: fileError,
        handleFileChange,
        resetFile
    } = useFileHandler({maxFileSize, allowedMimeTypes});

    useEffect(() => {
        setSavedImageUrl(imageUrl);
    }, [imageUrl]);

    useEffect(() => {
        if (fileError) notify.error(fileError);
    }, [fileError, notify]);

    const handleSave = useCallback(async ({blob, type, ext}) => {
        resetFile();
        setLoading(true);
        try {
            const file = new File([blob], `avatar.${ext}`, {type});
            await onSaveImage({file});
        } catch (error) {
            notify.error(error.message);
        } finally {
            setLoading(false);
        }
    }, [onSaveImage, notify, resetFile]);

    return (
        <>
            <Overlay isVisible={loading}/>
            <ContainerStyled>
                <HiddenInputStyled
                    type="file"
                    accept={allowedMimeTypes.map(t => `.${t.split('/')[1]}`).join(', ')}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                />

                <ImageEditorModal
                    editingImage={editingImage}
                    onSave={handleSave}
                    onCancel={resetFile}
                />

                <ProfileImageContainerStyled>
                    {savedImageUrl ? (
                        <ProgressiveImage src={savedImageUrl} alt="User Avatar"/>
                    ) : (
                        <Avatar avatarUrl={savedImageUrl}/>
                    )}
                    {loading && <UploadLoader/>}
                    <EditButtonStyled onClick={() => fileInputRef.current.click()}>
                        <FaCamera/>
                    </EditButtonStyled>
                </ProfileImageContainerStyled>
            </ContainerStyled>
        </>
    );
}

ProfileImageUploader.propTypes = {
    onSaveImage: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    maxFileSize: PropTypes.number,
    allowedMimeTypes: PropTypes.arrayOf(PropTypes.string)
};

export default React.memo(ProfileImageUploader);
