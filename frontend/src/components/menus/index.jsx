import React, {useEffect, useRef, useState} from "react";
import PropTypes from 'prop-types';
import {MdKeyboardArrowLeft, MdKeyboardArrowRight} from "react-icons/md";
import {BsThreeDots} from "react-icons/bs";
import {TiTickOutline} from "react-icons/ti";
import {CSSTransition, TransitionGroup} from "react-transition-group";
import useOutsideClick from "@/hooks/useOutsideClick";
import useMediaSize from "@/hooks/useMediaSize";
import useMobileDrag from "@/hooks/useMobileDrag";
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

const Menu = ({children, containerStyle, options, triggerIcon = <BsThreeDots/>, triggerElement, mobileSize = 600}) => {
    const [menuStack, setMenuStack] = useState([options]);
    const [direction, setDirection] = useState("left");
    const [menuOpen, setMenuOpen] = useState(false);

    const wrapperRef = useRef(null);
    const menuWrapperRef = useRef(null);
    const menuRef = useRef(null);
    const observersRef = useRef(new Set());
    const triggerRef = useRef(null);
    const optionsRef = useRef(null);
    const isMobile = useMediaSize(mobileSize);

    const {
        dragOffset,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp
    } = useMobileDrag(isMobile, () => setMenuOpen(false));

    useOutsideClick(wrapperRef, () => setMenuOpen(false), [menuWrapperRef]);

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
    };

    // Accessible trigger button
    const renderTrigger = () => (
        triggerElement ?
            React.cloneElement(triggerElement, {
                ref: triggerRef,
                role: "button",
                'aria-haspopup': "menu",
                'aria-expanded': menuOpen,
                tabIndex: 0,
                onClick: () => handleToggle()
            }) :
            <DynamicMenuTriggerButton
                ref={triggerRef}
                onClick={handleToggle}
                $isOpen={menuOpen}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-label="Open menu"
                tabIndex={0}
            >
                {triggerIcon}
            </DynamicMenuTriggerButton>
    );

    // Accessible menu items
    const renderMenuItem = (option, index) => (
        <OptionWrapperStyled key={option.text} role="none">
            <OptionStyled
                role={"menuitem"}
                aria-haspopup={option.submenu ? "menu" : undefined}
                aria-checked={option.selected ? "true" : undefined}
                aria-disabled={option.disabled ? "true" : undefined}
                tabIndex={index === 0 ? 0 : -1}
                $danger={option.danger}
                $disabled={option.disabled}
                onClick={() => handleSelection(option)}
            >
                <OptionIconTextContainerStyled>
                    <OptionIconStyled aria-hidden="true">
                        {option.icon}
                    </OptionIconStyled>
                    <OptionTextStyled>{option.text}</OptionTextStyled>
                </OptionIconTextContainerStyled>
                <OptionIconsContainerStyled aria-hidden="true">
                    {option.selected && <TiTickOutline/>}
                    {option.submenu && <MdKeyboardArrowRight/>}
                </OptionIconsContainerStyled>
            </OptionStyled>
        </OptionWrapperStyled>
    );

    // Accessible back button
    const renderBackButton = () => (
        <OptionWrapperStyled role="none">
            <OptionStyled
                role="menuitem"
                tabIndex={0}
                onClick={handleBack}
            >
                <OptionIconStyled aria-hidden="true">
                    < MdKeyboardArrowLeft/>
                </OptionIconStyled>
                <OptionTextStyled>Back</OptionTextStyled>
            </OptionStyled>
        </OptionWrapperStyled>
    );

    const handleToggle = () => setMenuOpen(prev => !prev);

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
            {renderTrigger()}

            <DynamicMenuWrapperStyled
                ref={menuWrapperRef}
                $mobileSize={mobileSize}
                $isOpen={menuOpen}
                role="menu"
                aria-label="Navigation menu"
                aria-orientation="vertical"
            >
                <CSSTransition in={menuOpen} timeout={300} classNames="menu" unmountOnExit nodeRef={menuRef}>
                    <DynamicMenuContainerStyled
                        ref={menuRef}
                        $mobileSize={mobileSize}
                        style={{...(!isMobile ? containerStyle : {}), ...(isMobile ? {translate: `0 ${dragOffset}px`} : {})}}
                        role="presentation"
                        aria-live="polite"
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {isMobile && <DynamicMenuHeaderStyled aria-hidden="true"/>}

                        {children}

                        <OptionsWrapperStyled
                            ref={optionsRef}
                            $mobileSize={mobileSize}
                        >
                            <TransitionGroup component={null}>
                                <CSSTransition
                                    key={menuStack.length}
                                    timeout={200}
                                    classNames={`slide-${direction}`}
                                    nodeRef={null}
                                >
                                    <OptionsStyled
                                        $mobileSize={mobileSize}
                                    >
                                        {menuStack.length > 1 && renderBackButton()}
                                        {currentMenu.map((option, index) => renderMenuItem(option, index))}
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
