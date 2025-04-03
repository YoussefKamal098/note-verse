import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {AnimatePresence} from 'framer-motion';
import {FaArrowRotateLeft, FaArrowRotateRight} from 'react-icons/fa6';
import {CgClose} from 'react-icons/cg';
import Button, {BUTTON_TYPE} from '../buttons/Button';
import useImageProcessor from '../../hooks/useImageProcessor';
import Overlay from '../common/Overlay';

import {
    AvatarEditorStyled,
    CloseButtonStyled,
    ControlsButtonsStyled,
    ControlsStyled,
    EditorContainerStyled,
    HeaderStyled,
    ModalContentStyled,
    modalContentVariants,
    ModalOverlayStyled,
    modalOverlayVariants,
    TitleStyled,
    ToolsStyled,
    ToolStyled
} from './ProfileImageUploaderStyles';

const ImageEditorModal = ({
                              editingImage,
                              onSave,
                              onCancel
                          }) => {
    const editorRef = useRef(null);
    const {isProcessing, processImage} = useImageProcessor();
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);

    const handleSave = useCallback(async () => {
        const canvas = editorRef.current.getImageScaledToCanvas();
        const blob = await processImage(canvas);
        onSave({blob, type: "image/webp", ext: "webp"});
    }, [processImage, onSave]);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.1 : -0.1;
        setScale(prev => Math.min(Math.max(prev + delta, 0.5), 3));
    }, []);

    return (
        <>
            <Overlay isVisible={isProcessing}/>
            <AnimatePresence>
                {editingImage && (
                    <ModalOverlayStyled
                        onClick={onCancel}
                        variants={modalOverlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        transition={{duration: 0.3}}
                    >
                        <ModalContentStyled
                            onClick={(e) => e.stopPropagation()}
                            variants={modalContentVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{duration: 0.3}}
                        >
                            <HeaderStyled>
                                <TitleStyled>Upload a New Avatar</TitleStyled>
                                <CloseButtonStyled onClick={onCancel}>
                                    <CgClose/>
                                </CloseButtonStyled>
                            </HeaderStyled>
                            <EditorContainerStyled>
                                <AvatarEditorStyled
                                    ref={editorRef}
                                    image={editingImage}
                                    width={250}
                                    height={250}
                                    border={50}
                                    borderRadius={125}
                                    color={[255, 255, 255, 0.6]}
                                    scale={scale}
                                    rotate={rotate}
                                    onWheel={handleWheel}
                                />
                                <ControlsStyled>
                                    <ToolsStyled>
                                        <ToolStyled onClick={() => setRotate(prev => prev - 90)}>
                                            <FaArrowRotateLeft/>
                                        </ToolStyled>
                                        <ToolStyled onClick={() => setRotate(prev => prev + 90)}>
                                            <FaArrowRotateRight/>
                                        </ToolStyled>
                                    </ToolsStyled>
                                    <ControlsButtonsStyled>
                                        <Button
                                            type={BUTTON_TYPE.SUCCESS}
                                            onClick={handleSave}
                                            disabled={isProcessing}
                                            loading={isProcessing}
                                        >
                                            Save
                                        </Button>
                                        <Button type={BUTTON_TYPE.DANGER} onClick={onCancel}>
                                            Cancel
                                        </Button>
                                    </ControlsButtonsStyled>
                                </ControlsStyled>
                            </EditorContainerStyled>
                        </ModalContentStyled>
                    </ModalOverlayStyled>
                )}
            </AnimatePresence>
        </>
    );
};

ImageEditorModal.propTypes = {
    editingImage: PropTypes.instanceOf(File),
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default React.memo(ImageEditorModal);
