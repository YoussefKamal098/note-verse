import React, {useEffect, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {FaCamera} from 'react-icons/fa';
import {FaArrowRotateLeft, FaArrowRotateRight} from 'react-icons/fa6';
import {CgClose} from 'react-icons/cg';
import {AnimatePresence} from 'framer-motion';
import {formatBytes} from 'shared-utils/string.utils';
import Button, {BUTTON_TYPE} from '../buttons/Button';
import {useToastNotification} from '../../contexts/ToastNotificationsContext';
import ProgressiveImage from '../progressiveImage/ProgressiveImage';

import {
    AvatarEditorStyled,
    CircleStyled,
    CloseButtonStyled,
    ContainerStyled,
    ControlsButtonsStyled,
    ControlsStyled,
    EditButtonStyled,
    EditorContainerStyled,
    HeaderStyled,
    HiddenInputStyled,
    ModalContentStyled,
    modalContentVariants,
    ModalOverlayStyled,
    modalOverlayVariants,
    ProfileImageContainerStyled,
    SvgLoaderStyled,
    TitleStyled,
    ToolsStyled,
    ToolStyled
} from './ProfileImageUploaderStyles';

const Loader = () => (
    <SvgLoaderStyled viewBox="0 0 50 50">
        <CircleStyled cx="25" cy="25" r="24" fill="none" strokeWidth="1.5"/>
    </SvgLoaderStyled>
);

const ProfileImageUploader = ({
                                  onSaveImage,
                                  imageUrl,
                                  maxFileSize = 1024 * 1024, // 1MB default
                                  allowedMimeTypes = ['image/png', 'image/jpeg', 'image/webp']
                              }) => {
    const {notify} = useToastNotification();
    const [savedImageUrl, setSavedImageUrl] = useState(imageUrl);
    const [editingImage, setEditingImage] = useState(null);
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [loading, setLoading] = useState(false);
    const editorRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setSavedImageUrl(imageUrl);
    }, [imageUrl]);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type and size
        if (!allowedMimeTypes.includes(file.type)) {
            notify.error(`Unsupported file type: ${file.type}`);
            event.target.value = '';
            return;
        }

        if (file.size > maxFileSize) {
            notify.error(`File exceeds ${formatBytes(maxFileSize)} limit`);
            event.target.value = '';
            return;
        }

        setEditingImage(file);
    };

    const handleWheel = (event) => {
        event.preventDefault();
        const delta = event.deltaY;
        if (delta < 0) {
            setScale((prev) => Math.min(prev + 0.1, 3));
        } else {
            setScale((prev) => Math.max(prev - 0.1, 0.5));
        }
    };

    const handleSave = async () => {
        if (!editorRef.current) return;

        setEditingImage(null);
        setLoading(true);

        try {
            const canvas = editorRef.current.getImageScaledToCanvas();

            // Convert canvas to PNG Blob
            const blob = await new Promise((resolve, reject) => {
                canvas.toBlob(
                    (blob) =>
                        blob ? resolve(blob) : reject(new Error('Canvas conversion failed')),
                    'image/png'
                );
            });

            // Create PNG File from Blob
            const file = new File([blob], 'avatar.png', {
                type: 'image/png',
            });

            if (file.size > maxFileSize) {
                notify.error(`Edited image exceeds ${formatBytes(maxFileSize)} limit`);
                return;
            }

            // Pass only the File to parent
            const savedUrl = await onSaveImage({file});
            setSavedImageUrl(savedUrl);
        } catch (error) {
            notify.error(error.message);
        } finally {
            setLoading(false);
            setScale(1);
            setRotate(0);
        }
    };

    const handleCancel = () => {
        setEditingImage(null);
        setScale(1);
        setRotate(0);
    };

    return (
        <ContainerStyled>
            <HiddenInputStyled
                type="file"
                accept={allowedMimeTypes.map((t) => `.${t.split('/')[1]}`).join(', ')}
                onChange={handleFileChange}
                ref={fileInputRef}
            />
            <AnimatePresence>
                {editingImage && (
                    <ModalOverlayStyled
                        variants={modalOverlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{duration: 0.3}}
                    >
                        <ModalContentStyled
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{duration: 0.3}}
                        >
                            <HeaderStyled>
                                <TitleStyled>Upload a New Avatar</TitleStyled>
                                <CloseButtonStyled onClick={handleCancel}>
                                    <CgClose/>
                                </CloseButtonStyled>
                            </HeaderStyled>
                            <EditorContainerStyled>
                                <AvatarEditorStyled
                                    onWheel={handleWheel}
                                    ref={editorRef}
                                    image={editingImage}
                                    width={250}
                                    height={250}
                                    border={50}
                                    borderRadius={125}
                                    color={[255, 255, 255, 0.6]}
                                    scale={scale}
                                    rotate={rotate}
                                />
                                <ControlsStyled>
                                    <ToolsStyled>
                                        <ToolStyled onClick={() => setRotate((prev) => prev - 90)}>
                                            <FaArrowRotateLeft/>
                                        </ToolStyled>
                                        <ToolStyled onClick={() => setRotate((prev) => prev + 90)}>
                                            <FaArrowRotateRight/>
                                        </ToolStyled>
                                    </ToolsStyled>
                                    <ControlsButtonsStyled>
                                        <Button type={BUTTON_TYPE.SUCCESS} onClick={handleSave}>
                                            Save
                                        </Button>
                                        <Button type={BUTTON_TYPE.DANGER} onClick={handleCancel}>
                                            Cancel
                                        </Button>
                                    </ControlsButtonsStyled>
                                </ControlsStyled>
                            </EditorContainerStyled>
                        </ModalContentStyled>
                    </ModalOverlayStyled>
                )}
            </AnimatePresence>
            <ProfileImageContainerStyled>
                <ProgressiveImage src={savedImageUrl} alt="avatar"/>
                {loading && <Loader/>}
                <EditButtonStyled onClick={triggerFileInput}>
                    <FaCamera/>
                </EditButtonStyled>
            </ProfileImageContainerStyled>
        </ContainerStyled>
    );
};

ProfileImageUploader.propTypes = {
    onSaveImage: PropTypes.func.isRequired,
    imageUrl: PropTypes.string.isRequired,
    maxFileSize: PropTypes.number,
    allowedMimeTypes: PropTypes.arrayOf(PropTypes.string),
};

export default React.memo(ProfileImageUploader);
