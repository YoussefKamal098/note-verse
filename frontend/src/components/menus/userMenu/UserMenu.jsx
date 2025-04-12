import React, {useEffect, useRef, useState} from "react";
import {CSSTransition} from "react-transition-group";
import {useNavigate} from "react-router-dom";
import {MdKeyboardArrowRight, MdKeyboardArrowUp, MdNoteAlt} from "react-icons/md";
import {LuLightbulb, LuLightbulbOff} from "react-icons/lu";
import {RiUserSettingsLine} from "react-icons/ri";
import {FaArrowRightFromBracket} from "react-icons/fa6";
import {TiTickOutline} from "react-icons/ti";
import Overlay from "../../common/Overlay";
import Spinner from "../../buttons/LoadingSpinnerButton";
import {useAuth} from "../../../contexts/AuthContext";
import {useTheme} from "../../../contexts/ThemeContext";
import useIsMobile from "../../../hooks/useIsMobile";
import useResize from "../../../hooks/useResize";
import useOutsideClick from "../../../hooks/useOutsideClick";
import {useToastNotification} from "../../../contexts/ToastNotificationsContext";
import Avatar from '../../common/Avatar';
import RoutesPaths from "../../../constants/RoutesPaths";
import authService from "../../../api/authService";

import {
    ArrowStyled,
    OptionIconStyled,
    OptionsStyled,
    OptionStyled,
    OptionTextStyled,
    OptionWrapperStyled,
} from "../MenuStyled";

import {
    AppearanceMenuStyled,
    AvatarStyled,
    BarsContainerStyled,
    CloseButtonStyled,
    FullNameStyled,
    HeaderStyled,
    MenuBarsStyled,
    MenuCloseButtonContainerStyled,
    UserMenuAvatarStyled,
    UserMenuContainerStyled,
} from "./UserMenuStyled";


const UserMenu = () => {
    const mobileSize = 768;
    const navigate = useNavigate();
    const {user} = useAuth();
    const {theme, setTheme} = useTheme();
    const {notify} = useToastNotification();

    const [menuOpen, setMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [appearanceMenuOpen, setAppearanceMenuOpen] = useState(false);

    const [closeButtonStyle, setCloseButtonStyle] = useState({});
    const wrapperRef = useRef(null);
    const menuRef = useRef(null);
    const barsContainerRef = useRef(null);

    // Get current window dimensions.
    const {width} = useResize();
    // Determine if mobile using our reusable hook.
    const isMobile = useIsMobile(mobileSize);

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

    const handleRouteOptionCLick = (route) => () => {
        navigate(route);
        setMenuOpen(false);
    };

    // Use our reusable hook to close the menu on outside clicks.
    useOutsideClick(wrapperRef, () => setMenuOpen(false));

    // When the menu is open on mobile, update the close button's position based on the BarsContainer's position.
    useEffect(() => {
        if (isMobile && menuOpen && barsContainerRef.current) {
            const rect = barsContainerRef.current.getBoundingClientRect();
            setCloseButtonStyle({
                top: `${rect.top}px`,
                left: `${rect.left}px`,
            });
        }
    }, [isMobile, menuOpen, width]);

    return (
        <>
            <Overlay isVisible={isLoggingOut}/>
            <div style={{position: "relative"}} ref={wrapperRef}>
                {isMobile ? (
                    <BarsContainerStyled onClick={toggleMenu} ref={barsContainerRef}>
                        <MenuBarsStyled className={menuOpen ? "open" : ""}/>
                    </BarsContainerStyled>
                ) : (
                    <AvatarStyled onClick={toggleMenu}>
                        <Avatar avatarUrl={user.avatarUrl}/>
                    </AvatarStyled>
                )}

                <CSSTransition in={menuOpen} timeout={300} classNames="menu" unmountOnExit appear nodeRef={menuRef}>
                    <UserMenuContainerStyled ref={menuRef} mobile_size={mobileSize}>
                        {isMobile && (
                            <MenuCloseButtonContainerStyled onClick={() => setMenuOpen(false)} style={closeButtonStyle}>
                                <CloseButtonStyled className={menuOpen ? "" : "close"}/>
                            </MenuCloseButtonContainerStyled>
                        )}

                        <HeaderStyled>
                            <UserMenuAvatarStyled onClick={handleRouteOptionCLick(RoutesPaths.HOME)}>
                                <Avatar avatarUrl={user.avatarUrl}/>
                            </UserMenuAvatarStyled>
                            <FullNameStyled>
                                {user.firstname} {user.lastname}
                            </FullNameStyled>
                        </HeaderStyled>


                        <OptionsStyled>
                            <OptionWrapperStyled>
                                <OptionStyled onClick={handleRouteOptionCLick(RoutesPaths.PROFILE)}>
                                    <OptionIconStyled>
                                        <RiUserSettingsLine/>
                                    </OptionIconStyled>
                                    <OptionTextStyled>Profile</OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>

                            <OptionWrapperStyled className="appearance-wrapper">
                                <OptionStyled onClick={toggleAppearanceMenu}>
                                    <OptionIconStyled>
                                        {theme === "light" ? <LuLightbulb/> : <LuLightbulbOff/>}
                                    </OptionIconStyled>
                                    <OptionTextStyled>Appearance</OptionTextStyled>
                                    <ArrowStyled className={isMobile && appearanceMenuOpen ? "open" : ""}>
                                        {isMobile ? <MdKeyboardArrowUp/> : <MdKeyboardArrowRight/>}
                                    </ArrowStyled>
                                </OptionStyled>

                                <AppearanceMenuStyled is_open={appearanceMenuOpen ? "true" : undefined}
                                                      mobile_size={mobileSize}>
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
                                <OptionStyled onClick={handleRouteOptionCLick(RoutesPaths.NOTE("new"))}>
                                    <OptionIconStyled>
                                        <MdNoteAlt/>
                                    </OptionIconStyled>
                                    <OptionTextStyled>Add a new note</OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>

                            <OptionWrapperStyled>
                                <OptionStyled onClick={logoutUser} danger={"true"}>
                                    <OptionIconStyled>
                                        <Spinner loading={isLoggingOut} color="var(--color-danger)">
                                            <FaArrowRightFromBracket/>
                                        </Spinner>
                                    </OptionIconStyled>
                                    <OptionTextStyled>Sign Out</OptionTextStyled>
                                </OptionStyled>
                            </OptionWrapperStyled>
                        </OptionsStyled>
                    </UserMenuContainerStyled>
                </CSSTransition>
            </div>
        </>
    );
};

export default React.memo(UserMenu);
