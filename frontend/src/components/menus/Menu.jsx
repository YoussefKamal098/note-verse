import React, {useEffect, useRef, useState} from "react";
import PropTypes from 'prop-types';
import {MdKeyboardArrowRight} from "react-icons/md";
import {BsThreeDots} from "react-icons/bs";
import {TiChevronLeftOutline, TiTickOutline} from "react-icons/ti";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import useOutsideClick from "../../hooks/useOutsideClick";
import useIsMobile from "../../hooks/useIsMobile";
import useMobileDrag from "../../hooks/useMobileDrag";

import {
    DynamicMenuContainerStyled,
    DynamicMenuHeaderStyled,
    DynamicMenuTriggerButton,
    DynamicMenuWrapperStyled,
    OptionIconsContainerStyled,
    OptionIconStyled,
    OptionIconTextContainerStyled,
    OptionsStyled,
    OptionStyled,
    OptionsWrapperStyled,
    OptionTextStyled,
    OptionWrapperStyled
} from "./MenuStyled";

const Menu = ({children, options, triggerIcon = <BsThreeDots/>, triggerElement, mobileSize = 600}) => {
    const [menuStack, setMenuStack] = useState([options]);
    const [direction, setDirection] = useState("left");
    const [menuOpen, setMenuOpen] = useState(false);

    const wrapperRef = useRef(null);
    const menuWrapperRef = useRef(null);
    const menuRef = useRef(null);
    const observersRef = useRef(new Set());

    const isMobile = useIsMobile(mobileSize);

    const {
        dragOffset,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp
    } = useMobileDrag(isMobile, () => setMenuOpen(false));

    useOutsideClick(wrapperRef, () => setMenuOpen(false), [menuWrapperRef.current]);

    const currentMenu = menuStack[menuStack.length - 1];

    const observeAndSwapClass = (directionFrom, directionTo) => {
        const menuElement = menuRef.current;
        if (!menuElement) return;

        const element = menuRef.current.querySelector(`[class^="slide-${directionFrom}"], [class*=" slide-${directionFrom}"]`);
        if (!element) return;

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    const addedClass = [...element.classList].find(
                        (cls) => cls.startsWith(`slide-${directionFrom}`) && !mutation.oldValue?.includes(cls)
                    );

                    if (addedClass) {
                        const newClass = addedClass.replace(`slide-${directionFrom}`, `slide-${directionTo}`);

                        requestAnimationFrame(() => {
                            element.classList.remove(addedClass);
                            element.classList.add(newClass);
                            observer.disconnect();
                            observersRef.current.delete(observer);
                        });
                    }
                }
            }
        });

        observer.observe(element, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ["class"],
        });

        observersRef.current.add(observer);
    };

    const handleSubmenu = (submenuOptions) => {
        observeAndSwapClass("right", "left");
        setDirection("right");
        setMenuStack((prev) => [...prev, submenuOptions]);
    };

    const handleBack = () => {
        observeAndSwapClass("left", "right");
        setDirection("left");
        setMenuStack((prev) => prev.slice(0, -1));
    };

    const handleSelection = (option) => {
        if (option.disabled) return;

        if (option.submenu) {
            handleSubmenu(option.submenu);
        } else if (option.action) {
            option.action();
            setMenuOpen(false);
        }
    };

    const clearObservers = () => {
        observersRef.current.forEach((observer) => observer.disconnect());
        observersRef.current.clear();
    }

    useEffect(() => {
        if (!menuOpen) {
            clearObservers();
            setMenuStack([options]);
            setDirection("left");
        }
    }, [menuOpen, options]);

    useEffect(() => {
        return () => clearObservers();
    }, []);

    return (
        <div ref={wrapperRef} style={{position: "relative"}}>
            {triggerElement ?
                <div onClick={() => setMenuOpen(!menuOpen)}>
                    {triggerElement}
                </div> :
                <DynamicMenuTriggerButton
                    onClick={() => setMenuOpen(!menuOpen)}
                    $isOpen={menuOpen}
                >
                    {triggerIcon}
                </DynamicMenuTriggerButton>
            }

            <DynamicMenuWrapperStyled
                ref={menuWrapperRef}
                $mobileSize={mobileSize}
                $isOpen={menuOpen}
            >
                <CSSTransition in={menuOpen} timeout={300} classNames="menu" unmountOnExit nodeRef={menuRef}>
                    <DynamicMenuContainerStyled
                        ref={menuRef}
                        $mobileSize={mobileSize}
                        style={isMobile ? {translate: `0 ${dragOffset}px`} : {}}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {isMobile && <DynamicMenuHeaderStyled/>}

                        {children}

                        <OptionsWrapperStyled>
                            <TransitionGroup component={null}>
                                <CSSTransition
                                    key={menuStack.length}
                                    timeout={300}
                                    classNames={`slide-${direction}`}
                                    nodeRef={null}
                                >
                                    <OptionsStyled $mobileSize={mobileSize}>
                                        {menuStack.length > 1 && (
                                            <OptionWrapperStyled>
                                                <OptionStyled onClick={handleBack}>
                                                    <OptionIconStyled>
                                                        <TiChevronLeftOutline/>
                                                    </OptionIconStyled>
                                                    <OptionTextStyled>Back</OptionTextStyled>
                                                </OptionStyled>
                                            </OptionWrapperStyled>
                                        )}

                                        {currentMenu.map((option, index) => (
                                            <OptionWrapperStyled key={index}>
                                                <OptionStyled
                                                    onClick={() => handleSelection(option)}
                                                    $danger={option.danger}
                                                    $disabled={option.disabled}
                                                >
                                                    <OptionIconTextContainerStyled>
                                                        <OptionIconStyled>{option.icon}</OptionIconStyled>
                                                        <OptionTextStyled>{option.text}</OptionTextStyled>
                                                    </OptionIconTextContainerStyled>

                                                    <OptionIconsContainerStyled>
                                                        {option.selected && <TiTickOutline/>}
                                                        {option.submenu && <MdKeyboardArrowRight/>}
                                                    </OptionIconsContainerStyled>
                                                </OptionStyled>
                                            </OptionWrapperStyled>
                                        ))}
                                    </OptionsStyled>
                                </CSSTransition>
                            </TransitionGroup>
                        </OptionsWrapperStyled>

                    </DynamicMenuContainerStyled>
                </CSSTransition>
            </DynamicMenuWrapperStyled>
        </div>
    );
};

// Custom lazy helper that defers evaluation of a PropTypes validator
const lazy = (fn) => {
    return function validate(props, propName, componentName, ...rest) {
        const validator = fn();
        return validator(props, propName, componentName, ...rest);
    };
};

// Define recursive menu option shape
const menuOptionShape = PropTypes.shape({
    /** Primary display text for the menu option */
    text: PropTypes.string.isRequired,

    /** Icon element displayed before the text */
    icon: PropTypes.element,

    /** Action handler when option is selected */
    action: PropTypes.func,

    /** Nested menu options for submenus */
    submenu: PropTypes.arrayOf(lazy(() => menuOptionShape)),

    /** Dangerous state styling (e.g., delete actions) */
    danger: PropTypes.bool,

    /** Disabled interaction state */
    disabled: PropTypes.bool,

    /** Visual-selected indicator */
    selected: PropTypes.bool,
});

Menu.propTypes = {
    /**
     * Custom content displayed above menu options
     * @example <MenuHeader>Recent Items</MenuHeader>
     */
    children: PropTypes.node,

    /**
     * Primary menu configuration (supports infinite nesting)
     * @example
     * [{
     *   text: 'Edit',
     *   icon: <EditIcon />,
     *   submenu: [{ text: 'Copy', action: handleCopy }]
     * }]
     */
    options: PropTypes.arrayOf(menuOptionShape).isRequired,

    /**
     * Default trigger icon (override by triggerElement)
     * @default <BsThreeDots />
     */
    triggerIcon: PropTypes.element,

    /**
     * Custom trigger element (replaces default icon trigger)
     * @example <button className="custom-trigger">Menu</button>
     */
    triggerElement: PropTypes.node,

    /**
     * Viewport width (px) where mobile interaction behaviors activate
     * @default 600
     */
    mobileSize: PropTypes.number,
};

export default React.memo(Menu);
