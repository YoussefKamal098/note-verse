import React, {useRef} from 'react';
import styled from 'styled-components';
import Tooltip from "@/components/tooltip/Tooltip";
import CloseButton from '@/components/buttons/CloseButton';
import useOutsideClick from '@/hooks/useOutsideClick';
import {ContainerStyles} from './styles';

const SidePanelContainer = styled(ContainerStyles)`
    grid-area: ${({area}) => area || 'right'};
    max-width: ${({$show}) => ($show ? '300px' : '0')};
    ${({$show}) => !$show && 'padding-right: 0; padding-left: 0;'}
    transition: max-width 0.3s ease, padding 0.5s ease;

    ${({$isMobile, $show}) => $isMobile && `
        position: fixed;
        top: 0;
        right: 0;
        width: 80vw;
        max-width: 350px;
        height: 100vh;
        border-left: 1px solid var(--color-border);
        border-radius: 0;
        box-shadow: var(--box-shadow-hoverable);
        transform: ${$show ? 'translateX(0)' : 'translateX(100%)'};
        transition: transform 0.3s ease;
        z-index: 1000;
  `}
`;

const SidePanelHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
`;

const Title = styled.h2`
    display: flex;
    align-items: center;
    gap: 0.25em;
    font-size: 1.25em;
    font-weight: 600;
    color: var(--color-text);
`;

const IconWrapper = styled.span`
    display: flex;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-placeholder);
`;

const SidePanel = ({show, onClose, title, Icon, area, children, isMobile, iconTooltip, ...props}) => {
    const panelRef = useRef(null);

    useOutsideClick(panelRef, () => {
        if (isMobile && show) onClose?.();
    });

    return (
        <SidePanelContainer $show={show} ref={panelRef} area={area} $isMobile={isMobile} {...props}>
            <SidePanelHeader>
                <Title>
                    {title}
                    <IconWrapper>
                        {Icon && iconTooltip ? <Tooltip containerStyle={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center"
                        }} title={iconTooltip}>
                            <Icon/>
                        </Tooltip> : Icon && <Icon/>}
                    </IconWrapper>
                </Title>
                {isMobile && <CloseButton onClick={onClose}/>}
            </SidePanelHeader>
            {children}
        </SidePanelContainer>
    );
};

export default React.memo(SidePanel);
