import React, {useRef} from 'react';
import styled from 'styled-components';
import {MdPublic, MdVpnLock} from "react-icons/md";
import {RiPushpin2Fill, RiUnpinLine} from "react-icons/ri";
import {TbSettingsSpark} from "react-icons/tb";
import CloseButton from "../buttons/CloseButton";
import Toggle from "../toggle";
import useOutsideClick from '../../hooks/useOutsideClick'
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import useMediaSize from "../../hooks/useMediaSize";
import {ContainerStyles} from "./styles";
import {DEVICE_SIZES} from "@/constants/breakpoints";
import {media} from '@/utils/mediaQueries';

const RightContainerStyles = styled(ContainerStyles)`
    grid-area: right;
    max-width: ${({$show}) => $show ? '275px' : '0'};
    ${({$show}) => !$show && "padding-right: 0;padding-left: 0;"}
    transform: 0 0;
    transition: max-width 0.3s ease, padding 0.5s ease;

    ${media.tablet} {
        position: fixed;
        top: 0;
        right: 0;
        width: 60vw;
        max-width: 60vw;
        height: 100vh;
        border-left: 1px solid var(--color-border);
        border-radius: 0;
        box-shadow: var(--box-shadow-hoverable);
        transform: ${({$show}) => $show ? 'translateX(0)' : 'translateX(100%)'};
        transition: transform 0.3s ease;
        z-index: 1000;
    }
`;

const HeaderStyles = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`

const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 0.25em;
    font-size: 1.25em;
    font-weight: 600;
    color: var(--color-text);
`

const SettingsIcon = styled(TbSettingsSpark)`
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-primary);
`

const SettingsContainerStyles = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: 0.9em;
`;

const RightSettingsPanel = ({show, onClose}) => {
    const {actions, selectors} = useNoteContext();
    const {isNew} = useNoteSelector(selectors.getStatus);
    const {isPublic, isPinned} = useNoteSelector(selectors.getMeta);
    const panelRef = useRef(null);
    const isMobile = useMediaSize(DEVICE_SIZES.tablet);

    useOutsideClick(panelRef, () => {
        if (isMobile && show) onClose();
    });

    return (
        <RightContainerStyles $show={show} ref={panelRef}>
            <HeaderStyles>
                <Title>
                    Settings
                    <SettingsIcon/>
                </Title>
                {isMobile && <CloseButton onClick={onClose}/>}
            </HeaderStyles>

            <SettingsContainerStyles>
                <Toggle
                    checked={isPinned}
                    onChange={isNew ? actions.togglePinState : actions.togglePin}
                    labelPosition={"right"}
                    label={"Pin status"}
                    icon={isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>}
                />
                <Toggle
                    checked={isPublic}
                    onChange={isNew ? actions.toggleVisibilityState : actions.toggleVisibility}
                    label={"Public visibility"}
                    labelPosition={"right"}
                    icon={isPublic ? <MdPublic/> : <MdVpnLock/>}
                />
            </SettingsContainerStyles>
        </RightContainerStyles>
    );
};

export default React.memo(RightSettingsPanel);
