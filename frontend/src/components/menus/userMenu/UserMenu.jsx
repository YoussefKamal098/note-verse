import React, {useMemo, useState} from "react";
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
import RoutesPaths from "../../../constants/RoutesPaths";
import authService from "../../../api/authService";
import Menu from "../Menu";

import {AvatarStyled, FullNameStyled, HeaderStyled, UserMenuAvatarStyled} from "./UserMenuStyled";

const UserMenu = () => {
    const navigate = useNavigate();
    const {user} = useAuth();
    const {theme, setTheme} = useTheme();
    const {notify} = useToastNotification();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme);
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
        }
    };

    const options = useMemo(() => [
        {
            icon: <RiUserSettingsLine/>,
            text: "Profile",
            action: () => navigate(RoutesPaths.PROFILE),
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
            action: () => navigate(RoutesPaths.NOTE("new")),
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
    ], [theme, isLoggingOut, navigate]);

    const header = (
        <HeaderStyled>
            <UserMenuAvatarStyled onClick={() => navigate(RoutesPaths.HOME)}>
                <Avatar avatarUrl={user.avatarUrl}/>
            </UserMenuAvatarStyled>
            <FullNameStyled>
                {user.firstname} {user.lastname}
            </FullNameStyled>
        </HeaderStyled>
    );

    return (
        <>
            <Overlay isVisible={isLoggingOut}/>
            <Menu
                options={options}
                triggerElement={
                    <AvatarStyled>
                        <Avatar avatarUrl={user.avatarUrl}/>
                    </AvatarStyled>
                }
            >
                {header}
            </Menu>
        </>
    );
};

export default React.memo(UserMenu);
