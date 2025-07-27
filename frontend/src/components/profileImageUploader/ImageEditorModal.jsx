import React, {useCallback, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {AnimatePresence} from 'framer-motion';
import {FaArrowRotateLeft, FaArrowRotateRight} from 'react-icons/fa6';
import Button, {BUTTON_TYPE} from '@/components/buttons/Button';
import Overlay from '@/components/common/Overlay';
import CloseButton from "@/components/buttons/CloseButton";
import CustomSlider from '@/components/slider';
import useImageProcessor from '@/hooks/useImageProcessor';

import {
    AvatarEditorStyled,
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
} from './styles';

const SCALE_MIN = 0.5;
const SCALE_MAX = 3;

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
        setScale(prev => Math.min(Math.max(prev + delta, SCALE_MIN), SCALE_MAX));
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
                                <CloseButton onClick={onCancel}/>
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

                                <CustomSlider
                                    style={{marginBottom: "1.5rem"}}
                                    min={SCALE_MIN}
                                    max={SCALE_MAX}
                                    step={0.01}
                                    showLabel={false}
                                    defaultValue={parseFloat(scale.toFixed(1))}
                                    onChange={(e) => setScale(parseFloat(e.target.value))}
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
