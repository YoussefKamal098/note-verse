import React, {useEffect, useMemo, useRef, useState} from "react";
import {CSSTransition} from "react-transition-group";
import {useNavigate} from "react-router-dom";
import {getInitials} from "shared-utils/string.utils";
import {MdKeyboardArrowRight, MdKeyboardArrowUp, MdNoteAlt} from "react-icons/md";
import {LuLightbulb, LuLightbulbOff} from "react-icons/lu";
import {FaArrowRightFromBracket} from "react-icons/fa6";
import {TiTickOutline} from "react-icons/ti";
import Overlay from "../common/Overlay";
import Spinner from "../buttons/LoadingSpinnerButton";
import {useAuth} from "../../contexts/AuthContext";
import {useTheme} from "../../contexts/ThemeContext";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import RoutesPaths from "../../constants/RoutesPaths";
import authService from "../../api/authService";

import {
    AppearanceMenuStyled,
    ArrowStyled,
    AvatarStyled,
    BarsContainerStyled,
    BarsStyled,
    CloseButtonContainerStyled,
    CloseButtonStyled,
    FullNameStyled,
    HeaderStyled,
    MenuAvatarStyled,
    MenuContainerStyled,
    OptionIconStyled,
    OptionsStyled,
    OptionStyled,
    OptionTextStyled,
    OptionWrapperStyled,
} from "./UserMenuStyles";

const UserMenu = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {theme, setTheme} = useTheme();
    const {notify} = useToastNotification();
    const mobileSize = 768;
    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= mobileSize);
    const [closeButtonStyle, setCloseButtonStyle] = useState({});
    const wrapperRef = useRef(null);
    const menuRef = useRef(null);
    const barsContainerRef = useRef(null);

    const initials = useMemo(
        () => getInitials(user.firstname, user.lastname),
        [user.firstname, user.lastname]
    );

    const toggleMenu = () => {
        setMenuOpen((prev) => !prev);
    };

    const toggleAppearanceMenu = () => {
        setAppearanceMenuOpen((prev) => !prev);
    };

    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme);
        setMenuOpen(false);
    };

    const logoutUser = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            navigate(RoutesPaths.LOGIN);
        } catch (error) {
            notify.error(`Logout error: ${error.message}`);
        } finally {
            setIsLoggingOut(false);
            setMenuOpen(false);
        }
    };

    const handleAddNewNoteOptionCLick = () => navigate(RoutesPaths.NOTE("new"));

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // When the menu opens on mobile, update the CloseButton's position based on BarsContainer's position.
    useEffect(() => {
        const handleResize = () => {
            if (isMobile && menuOpen && barsContainerRef.current) {
                const rect = barsContainerRef.current.getBoundingClientRect();
                setCloseButtonStyle({
                    top: `${rect.top}px`,
                    left: `${rect.left}px`
                });
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [isMobile, menuOpen]);

    return (
        <>
            <Overlay isVisible={isLoggingOut}/>
            <div style={{position: "relative"}} ref={wrapperRef}>
                {isMobile ? (
                    <BarsContainerStyled onClick={toggleMenu} ref={barsContainerRef}>
                        <BarsStyled className={menuOpen ? "open" : ""}/>
                    </BarsContainerStyled>
                ) : (
                    <AvatarStyled onClick={toggleMenu}>
                        <span>{initials}</span>
                    </AvatarStyled>
                )}

                <CSSTransition
                    in={menuOpen}
                    timeout={300}
                    classNames="menu"
                    unmountOnExit
                    appear
                    nodeRef={menuRef}
                >
                    <MenuContainerStyled ref={menuRef} mobile_size={mobileSize}>
                        {isMobile ?
                            <CloseButtonContainerStyled onClick={() => setMenuOpen(false)} style={closeButtonStyle}>
                                <CloseButtonStyled className={menuOpen ? "" : "close"}></CloseButtonStyled>
                            </CloseButtonContainerStyled> : null}

                        <HeaderStyled>
                            <MenuAvatarStyled>
                                <span>{initials}</span>
                            </MenuAvatarStyled>
                            <FullNameStyled>
                                {user.firstname} {user.lastname}
                            </FullNameStyled>
                        </HeaderStyled>

                        <OptionsStyled>
                            <OptionWrapperStyled className="appearance-wrapper">
                                <OptionStyled onClick={toggleAppearanceMenu}>
                                    <OptionIconStyled>
                                        {theme === "light" ? < LuLightbulb/> : < LuLightbulbOff/>}
                                    </OptionIconStyled>
                                    <OptionTextStyled>Appearance</OptionTextStyled>
                                    <ArrowStyled className={isMobile && appearanceMenuOpen ? "open" : ""}>
                                        {isMobile ? <MdKeyboardArrowUp/> : <MdKeyboardArrowRight/>}
                                    </ArrowStyled>
                                </OptionStyled>

                                <AppearanceMenuStyled is_open={appearanceMenuOpen ? "true" : undefined}
                                                      mobile_size={mobileSize}
                                >
                                    <OptionsStyled>
                                        <OptionWrapperStyled>
                                            <OptionStyled onClick={() => handleThemeChange("light")}>
                                                <OptionTextStyled>
                                                    {theme === "light" && <TiTickOutline/>} Light
                                                </OptionTextStyled>
                                            </OptionStyled>
                                        </OptionWrapperStyled>
                                        <OptionWrapperStyled>
                                            <OptionStyled onClick={() => handleThemeChange("dark")}>
                                                <OptionTextStyled>
                                                    {theme === "dark" && <TiTickOutline/>} Dark
                                                </OptionTextStyled>
                                            </OptionStyled>
                                        </OptionWrapperStyled>
                                    </OptionsStyled>
                                </AppearanceMenuStyled>
                            </OptionWrapperStyled>

                            <OptionWrapperStyled>
                                <OptionStyled onClick={handleAddNewNoteOptionCLick}>
                                    <OptionIconStyled>
                                        <MdNoteAlt/>
                                    </OptionIconStyled>
                                    <OptionTextStyled>Add a new note</OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>

                            <OptionWrapperStyled>
                                <OptionStyled onClick={logoutUser}>
                                    <OptionIconStyled>
                                        <Spinner loading={isLoggingOut} color="var(--color-accent)">
                                            <FaArrowRightFromBracket/>
                                        </Spinner>
                                    </OptionIconStyled>
                                    <OptionTextStyled>Sign Out</OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>
                        </OptionsStyled>
                    </MenuContainerStyled>
                </CSSTransition>
            </div>
        </>
    );
};

export default React.memo(UserMenu);
