import React from 'react';
import styled from 'styled-components';
import {AnimatePresence, motion} from 'framer-motion';
import DraggableContainer from '@/components/draggableContainer';

// Animation variants
const overlayVariants = {
    visible: {opacity: 1},
    hidden: {opacity: 0}
};

const shockwaveVariants = {
    hidden: {
        // opacity: 0,
        scale: 0.5,
        y: 60,
        x: -10,
        rotate: -5
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        x: 0,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 15,
            mass: 0.8,
            velocity: 50,
            restDelta: 0.001,
            staggerChildren: 0.1
        }
    },
    // hover: {
    //     scale: 1.05,
    //     rotate: [0, 2, -2, 0],
    //     transition: {
    //         duration: 0.6,
    //         repeat: Infinity,
    //         repeatType: "reverse"
    //     }
    // },
    // tap: {
    //     scale: 0.95,
    //     rotate: [0, 1, -1, 0]
    // }
};

const ModalOverlay = styled(motion.div)`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${({$transparentOverly}) => $transparentOverly ? "transparent" : "rgba(0, 0, 0, 0.5)"};
    backdrop-filter: ${({$transparentOverly}) => $transparentOverly ? "none" : "blur(5px)"};
    will-change: backdrop-filter;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
`;

const ModalContent = styled(motion.div)`
    border-radius: ${({$maximize}) => $maximize ? "0" : "10px"};
    width: ${({$maximize, $width}) => $maximize ? "100vw" : $width};
    height: ${({$maximize, $height}) => $maximize ? "100vh" : $height};
    max-width: ${({$maximize, $maxWidth}) => $maximize ? "100vw" : $maxWidth};
    max-height: ${({$maximize, $maxHeight}) => $maximize ? "100vh" : $maxHeight};
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    transition: all ease 0.3s;
    transform-origin: center center;
`;

const Modal = ({
                   isOpen,
                   onClose,
                   children,
                   width = 'auto',
                   height = 'auto',
                   maxWidth = '925px',
                   maxHeight = '90vh',
                   disableBackdropClick = true,
                   draggable = false,
                   maximize = false,
                   contentStyle = {},
                   overlayStyle = {},
                   transparentOverly = false
               }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <ModalOverlay
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    $transparentOverly={transparentOverly}
                    variants={overlayVariants}
                    onClick={disableBackdropClick ? undefined : onClose}
                    style={overlayStyle}
                >
                    <DraggableContainer draggable={draggable} disabled={maximize}>
                        <ModalContent
                            $maximize={maximize}
                            $width={width}
                            $height={height}
                            $maxWidth={maxWidth}
                            $maxHeight={maxHeight}
                            variants={shockwaveVariants}
                            style={contentStyle}
                        >
                            {children}
                        </ModalContent>
                    </DraggableContainer>
                </ModalOverlay>
            )}
        </AnimatePresence>
    );
};

export default Modal;
