import React, {useRef, useState} from "react";
import {CSSTransition} from "react-transition-group";
import useOutsideClick from "../../hooks/useOutsideClick";
import useIsMobile from "../../hooks/useIsMobile";
import useMobileDrag from "../../hooks/useMobileDrag";

import {
    DynamicMenuContainerStyled,
    DynamicMenuHeaderStyled,
    DynamicMenuTriggerButton,
    DynamicMenuWrapperStyled,
    OptionIconStyled,
    OptionsStyled,
    OptionStyled,
    OptionTextStyled,
    OptionWrapperStyled
} from "./MenuStyled";

const Menu = ({options, triggerIcon, mobileSize = 600}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const wrapperRef = useRef(null);
    const menuWrapperRef = useRef(null);
    const menuRef = useRef(null);
    const isMobile = useIsMobile(mobileSize);

    const {dragOffset, handlePointerDown, handlePointerMove, handlePointerUp} =
        useMobileDrag(isMobile, () => setMenuOpen(false));

    useOutsideClick(
        wrapperRef,
        () => setMenuOpen(false),
        [menuWrapperRef.current]
    );

    const toggleMenu = () => setMenuOpen((prev) => !prev);

    return (
        <div ref={wrapperRef} style={{position: "relative"}}>
            <DynamicMenuTriggerButton onClick={toggleMenu} menu_open={menuOpen ? "true" : undefined}>
                {triggerIcon}
            </DynamicMenuTriggerButton>

            <DynamicMenuWrapperStyled
                mobile_size={mobileSize}
                ref={menuWrapperRef}
                menu_open={menuOpen ? "true" : undefined}
            >
                <CSSTransition in={menuOpen} timeout={3000} classNames="menu" unmountOnExit nodeRef={menuRef}>
                    <DynamicMenuContainerStyled
                        ref={menuRef}
                        mobile_size={mobileSize}
                        style={isMobile ? {translate: `0 ${dragOffset}px`} : {}}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {isMobile && <DynamicMenuHeaderStyled/>}
                        <OptionsStyled>
                            {options.map((option, index) => (
                                <OptionWrapperStyled key={index}>
                                    <OptionStyled
                                        onClick={() => {
                                            if (!option.disabled) {
                                                option.action();
                                                setMenuOpen(false);
                                            }
                                        }}
                                        danger={option.danger ? "danger" : undefined}
                                        disabled={option.disabled}
                                    >
                                        <OptionIconStyled>{option.icon}</OptionIconStyled>
                                        <OptionTextStyled>{option.text}</OptionTextStyled>
                                    </OptionStyled>
                                </OptionWrapperStyled>
                            ))}
                        </OptionsStyled>
                    </DynamicMenuContainerStyled>
                </CSSTransition>
            </DynamicMenuWrapperStyled>
        </div>
    );
};

export default React.memo(Menu);
