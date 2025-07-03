import React, {useState} from 'react';
import styled from 'styled-components';
import {FiCheck, FiCopy, FiMaximize2, FiMinimize2} from 'react-icons/fi';
import {TbDragDrop} from "react-icons/tb";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import Tooltip from "@/components/tooltip/Tooltip";
import CloseButton from "@/components/buttons/CloseButton";
import Loader from '@/components/common/Loader';
import Modal from "@/components/modal";

const PopupContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: var(--color-background);
    transition: all ease 0.3s;
    overflow: hidden;
    width: 100%;
    height: 100%;
`;

const PopupHeader = styled.div`
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid var(--color-border);
    background-color: var(--color-background-secondary);
    overflow-x: auto;
    gap: 50px;
`;

const Title = styled.h3`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    font-size: 1.5em;
    font-weight: 600;
    color: var(--color-text);
`;

const IconButton = styled.button`
    display: inline-flex;
    color: var(--color-placeholder);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.3s;

    &.active {
        color: var(--color-text-dark);
        background-color: var(--color-primary-hover);
    }

    &:hover {
        color: var(--color-text-dark);
        background-color: var(--color-primary-dark);
    }

    &:active {
        scale: 0.9;
    }
`;

const CopyButton = styled(IconButton)`
    ${({$copied}) => $copied ? `
        background-color: var(--color-accent);
        color: var(--color-text);
        animation: pulse 0.5s ease;
    ` : ''};

    &:hover {
        ${({$copied}) => $copied ? `
            background-color: var(--color-accent);
        ` : ''};
    }
`;

const ButtonGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;

const ContentArea = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    font-family: "Poppins", sans-serif;
    font-weight: 600;
    background-color: var(--color-background);
`;

const PopUpTap = ({
                      title,
                      titleIcon,
                      content,
                      children,
                      onClose,
                      isOpen,
                      isLoading = false,
                      showCopyButton = true,
                      showDragButton = true,
                      showMaximizeButton = true,
                      headerButtons = [],
                      onCopy,
                      className
                  }) => {
    const {notify} = useToastNotification();
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDraggable, setIsDraggable] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            if (onCopy) {
                await onCopy(content);
            } else {
                await navigator.clipboard.writeText(content);
            }
            setCopied(true);
            notify.success("Content copied to clipboard!");
            setTimeout(() => setCopied(false), 500);
        } catch (err) {
            notify.error("Failed to copy content");
        }
    };

    const toggleMaximize = () => setIsMaximized(!isMaximized);
    const toggleDraggable = () => setIsDraggable(!isDraggable);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width={'90vw'}
            height={'90vh'}
            maxWidth={'925px'}
            maxHeight={'800px'}
            draggable={isDraggable}
            maximize={isMaximized}
            transparentOverly={true}
            className={className}
        >
            <PopupContainer>
                {isLoading ? <Loader isAbsolute={true} color={'var(--color-primary)'}/> : (
                    <>
                        <PopupHeader>
                            <Title>
                                {title}
                                {titleIcon}
                            </Title>
                            <ButtonGroup>
                                {headerButtons.map((button) => (
                                    <Tooltip title={button.title} key={button.title}>
                                        <IconButton
                                            className={button.active ? "active" : ""}
                                            onClick={button.action}
                                        >
                                            {button.icon}
                                        </IconButton>
                                    </Tooltip>
                                ))}

                                {showDragButton && (
                                    <Tooltip title={isDraggable ? "UnDrag" : "Drag"}>
                                        <IconButton
                                            className={isDraggable ? "active" : ""}
                                            onClick={toggleDraggable}
                                        >
                                            <TbDragDrop/>
                                        </IconButton>
                                    </Tooltip>
                                )}

                                {showCopyButton && (
                                    <Tooltip title={copied ? "Copied!" : "Copy content"}>
                                        <CopyButton
                                            onClick={handleCopy}
                                            $copied={copied}
                                        >
                                            {copied ? <FiCheck/> : <FiCopy/>}
                                        </CopyButton>
                                    </Tooltip>
                                )}

                                {showMaximizeButton && (
                                    <Tooltip title={isMaximized ? "Minimize" : "Maximize"}>
                                        <IconButton
                                            className={isMaximized ? "active" : ""}
                                            onClick={toggleMaximize}
                                        >
                                            {isMaximized ? <FiMinimize2/> : <FiMaximize2/>}
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <CloseButton onClick={onClose}/>
                            </ButtonGroup>
                        </PopupHeader>

                        <ContentArea>
                            {children}
                        </ContentArea>
                    </>
                )}
            </PopupContainer>
        </Modal>
    );
};

export default React.memo(PopUpTap);
