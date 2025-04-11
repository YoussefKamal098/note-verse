import React, {useRef, useState} from "react";
import {CSSTransition} from "react-transition-group";
import {MdDeleteForever} from "react-icons/md";
import {BsDatabaseFillDown, BsDatabaseFillSlash, BsThreeDots} from "react-icons/bs";
import {RiPushpin2Fill, RiUnpinLine} from "react-icons/ri";
import useOutsideClick from "../../../hooks/useOutsideClick";
import useIsMobile from "../../../hooks/useIsMobile";
import useMobileDrag from "../../../hooks/useMobileDrag";
import {OptionIconStyled, OptionsStyled, OptionStyled, OptionTextStyled, OptionWrapperStyled} from "../MenuStyled";
import {
    NoteMenuContainerStyled,
    NoteMenuHeaderStyled,
    NoteMenuTriggerButton,
    NoteMenuWrapperStyled,
} from "./NoteMenuStyled";

const NoteMenu = ({
                      onDelete,
                      onSave,
                      onDiscard,
                      onTogglePin,
                      isPinned,
                      disableSave,
                      disableDiscard,
                      disableDelete,
                  }) => {
    const mobileSize = 600;
    const [menuOpen, setMenuOpen] = useState(false);
    const wrapperRef = useRef(null);
    const menuWrapperRef = useRef(null);
    const menuRef = useRef(null);

    // Determine mobile state using our reusable hook.
    const isMobile = useIsMobile(mobileSize);

    // Setup mobile drag functionality using our custom hook.
    const {dragOffset, handlePointerDown, handlePointerMove, handlePointerUp} =
        useMobileDrag(isMobile, () => setMenuOpen(false));

    // Close the menu when clicking outside the wrapper or on additional targets.
    useOutsideClick(
        wrapperRef,
        () => {
            setMenuOpen(false);
        },
        [menuWrapperRef.current]
    );

    // Toggle menu visibility.
    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    // Option handlers.
    const handlePin = () => {
        if (onTogglePin) onTogglePin();
        setMenuOpen(false);
    };

    const handleSave = () => {
        if (!disableSave && onSave) {
            onSave();
            setMenuOpen(false);
        }
    };

    const handleUnSave = () => {
        if (!disableDiscard && onDiscard) {
            onDiscard();
            setMenuOpen(false);
        }
    };

    const handleDelete = () => {
        if (!disableDelete && onDelete) {
            onDelete();
            setMenuOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} style={{position: "relative"}}>
            <NoteMenuTriggerButton onClick={toggleMenu} menu_open={menuOpen ? "true" : undefined}>
                <BsThreeDots/>
            </NoteMenuTriggerButton>

            <NoteMenuWrapperStyled
                mobile_size={mobileSize}
                ref={menuWrapperRef}
                menu_open={menuOpen ? "true" : undefined}
            >
                <CSSTransition in={menuOpen} timeout={3000} classNames="menu" unmountOnExit nodeRef={menuRef}>
                    <NoteMenuContainerStyled
                        ref={menuRef}
                        mobile_size={mobileSize}
                        style={isMobile ? {translate: `0 ${dragOffset}px`} : {}}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        {isMobile && <NoteMenuHeaderStyled/>}
                        <OptionsStyled>
                            <OptionWrapperStyled>
                                <OptionStyled onClick={handlePin}>
                                    <OptionIconStyled>
                                        {isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>}
                                    </OptionIconStyled>
                                    <OptionTextStyled>
                                        {isPinned ? "Unpin note" : "Pin note"}
                                    </OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>

                            {!disableSave && (
                                <OptionWrapperStyled>
                                    <OptionStyled onClick={handleSave}>
                                        <OptionIconStyled>
                                            <BsDatabaseFillDown/>
                                        </OptionIconStyled>
                                        <OptionTextStyled>
                                            Commit Changes
                                        </OptionTextStyled>
                                    </OptionStyled>
                                </OptionWrapperStyled>
                            )}

                            {!disableDiscard && (
                                <OptionWrapperStyled>
                                    <OptionStyled onClick={handleUnSave} danger>
                                        <OptionIconStyled>
                                            <BsDatabaseFillSlash/>
                                        </OptionIconStyled>
                                        <OptionTextStyled>
                                            Discard Changes
                                        </OptionTextStyled>
                                    </OptionStyled>
                                </OptionWrapperStyled>
                            )}

                            {!disableDelete && (<OptionWrapperStyled>
                                    <OptionStyled onClick={handleDelete} danger>
                                        <OptionIconStyled>
                                            <MdDeleteForever/>
                                        </OptionIconStyled>
                                        <OptionTextStyled>Delete Note</OptionTextStyled>
                                    </OptionStyled>
                                </OptionWrapperStyled>
                            )}
                        </OptionsStyled>
                    </NoteMenuContainerStyled>
                </CSSTransition>
            </NoteMenuWrapperStyled>
        </div>
    );
};

export default React.memo(NoteMenu);
