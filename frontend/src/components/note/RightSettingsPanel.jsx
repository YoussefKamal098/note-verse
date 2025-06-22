import React, {useRef} from 'react';
import styled from 'styled-components';
import {MdPublic, MdVpnLock} from "react-icons/md";
import {RiPushpin2Fill, RiUnpinLine} from "react-icons/ri";
import CloseButton from "../buttons/CloseButton";
import Toggle from "../toggle";
import useOutsideClick from '../../hooks/useOutsideClick'
import {useNoteContext, useNoteSelector} from "./hooks/useNoteContext";
import useIsMobile from "../../hooks/useIsMobile";
import {ContainerStyles} from "./styles";

const RightContainerStyles = styled(ContainerStyles)`
    grid-row: span 2;
    width: fit-content;
    max-width: ${({$show}) => $show ? '275px' : '0'};
    ${({$show}) => !$show && "padding-right: 0;padding-left: 0;"}
    transition: max-width 0.3s ease, padding 0.5s ease;

    @media (max-width: ${props => props.$mobileSize}px) {
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
        grid-row: auto;
    }
`;

const HeaderStyles = styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    flex-direction: row-reverse;
`

const SettingsContainerStyles = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 0.9em;
`;

const RightSettingsPanel = ({show, onClose, mobileSize = 768}) => {
    const {actions, selectors} = useNoteContext();
    const {isNew} = useNoteSelector(selectors.getStatus);
    const {isPublic, isPinned} = useNoteSelector(selectors.getMeta);
    const panelRef = useRef(null);
    const isMobile = useIsMobile(mobileSize);

    useOutsideClick(panelRef, () => {
        if (isMobile && show) onClose();
    });

    return (
        <RightContainerStyles $show={show} $mobileSize={mobileSize} ref={panelRef}>
            {isMobile && <HeaderStyles>
                <CloseButton onClick={onClose}/>
            </HeaderStyles>}

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
