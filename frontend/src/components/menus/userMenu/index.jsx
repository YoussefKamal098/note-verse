import React, {useCallback, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {MdNoteAlt} from "react-icons/md";
import {LuLightbulb, LuLightbulbOff} from "react-icons/lu";
import {RiUserSettingsLine} from "react-icons/ri";
import {FaArrowRightFromBracket} from "react-icons/fa6";
import Overlay from "../../common/Overlay";
import Spinner from "../../buttons/LoadingSpinnerButton";
import {useAuth} from "../../../contexts/AuthContext";
import {useTheme} from "../../../contexts/ThemeContext";
import {useToastNotification} from "../../../contexts/ToastNotificationsContext";
import Avatar from '../../common/Avatar';
import routesPaths from "../../../constants/routesPaths";
import authService from "../../../api/authService";
import Menu from "..";

import {AvatarStyled, FullNameStyled, HeaderStyled, UserMenuAvatarStyled} from "./UserMenuStyled";

const UserMenu = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {theme, setTheme} = useTheme();
    const {notify} = useToastNotification();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleThemeChange = useCallback((selectedTheme) => {
        setTheme(selectedTheme);
    }, []);

    const logoutUser = useCallback(async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
            navigate(routesPaths.LOGIN);
        } catch (error) {
            notify.error(`Logout error: ${error.message}`);
        } finally {
            setIsLoggingOut(false);
        }
    }, []);

    const options = useMemo(() => [
        {
            icon: <RiUserSettingsLine/>,
            text: "Profile",
            action: () => navigate(routesPaths.PROFILE),
        },
        {
            icon: theme === "light" ? <LuLightbulb/> : <LuLightbulbOff/>,
            text: "Appearance",
            submenu: [
                {
                    text: "Light",
                    selected: theme === "light",
                    action: () => handleThemeChange("light"),
                },
                {
                    text: "Dark",
                    selected: theme === "dark",
                    action: () => handleThemeChange("dark"),
                },
            ],
        },
        {
            icon: <MdNoteAlt/>,
            text: "Add a new note",
            action: () => navigate(routesPaths.NOTE("new")),
        },
        {
            icon: (
                <Spinner loading={isLoggingOut} color="var(--color-danger)">
                    <FaArrowRightFromBracket/>
                </Spinner>
            ),
            text: "Sign Out",
            danger: true,
            action: logoutUser,
        },
    ], [theme, isLoggingOut]);

    const header = useMemo(() => (
        <HeaderStyled>
            <UserMenuAvatarStyled onClick={() => navigate(routesPaths.HOME)}>
                <Avatar avatarUrl={user.avatarUrl}/>
            </UserMenuAvatarStyled>
            <FullNameStyled>
                {user.firstname} {user.lastname}
            </FullNameStyled>
        </HeaderStyled>
    ), [user]);

    const triggerElement = useMemo(() => (
        <AvatarStyled>
            <Avatar avatarUrl={user.avatarUrl}/>
        </AvatarStyled>
    ), [user]);

    return (
        <>
            <Overlay isVisible={isLoggingOut}/>
            <Menu
                options={options}
                triggerElement={triggerElement}
            >
                {header}
            </Menu>
        </>
    );
};

export default React.memo(UserMenu);
