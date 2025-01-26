import React from "react";
import {useNavigate} from "react-router-dom";
import RoutesPaths from "../../constants/RoutesPaths";
import {useGlobalSettings} from '../../contexts/GlobalSettingsContext';
import {useAuth} from "../../contexts/AuthContext";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import SearchBar from "../searchBar/SearchBar";
import AddButton from "../buttons/AddButton";
import ColorModeButton from "../buttons/ColorModeButton";
import Avatar from "../avatar/Avatar";
import {capitalizeStringFirstLetter} from "shared-utils/string.utils";
import authService from "../../api/authService";

import {
    FlexColumnAlignedStartStyled,
    LeftNavbarSideStyled,
    LogoutButtonStyled,
    MiddleNavbarSideStyled,
    NavbarContainerStyled,
    NavbarLogoStyled,
    NavbarWrapperContainerStyled,
    RightNavbarSideStyled,
    UserNameStyled
} from "./NavbarStyles";


const Navbar = ({
                    showSearch = false,
                    showAddNoteButton = false,
                    disableAddNoteButton = true,
                    onAddNoteButtonClick = () => ({}),
                    onSearch = (searchText) => searchText
                }) => {
    const {navbarPosition} = useGlobalSettings();
    const {user} = useAuth();
    const {notify} = useToastNotification();
    const navigate = useNavigate();

    const logoutUser = async () => {
        try {
            await authService.logout();
        } catch (error) {
            notify.error(`Logout error: ${error.message}`);
        }

        navigate(RoutesPaths.LOGIN);
    };

    return (
        <NavbarContainerStyled style={{position: navbarPosition}}>
            <NavbarWrapperContainerStyled className="container">
                <LeftNavbarSideStyled>
                    <NavbarLogoStyled>Notes</NavbarLogoStyled>
                </LeftNavbarSideStyled>

                <MiddleNavbarSideStyled>
                    {showSearch && <SearchBar onSearch={(searchText) => onSearch(searchText)}/>}
                </MiddleNavbarSideStyled>

                {user &&
                    <RightNavbarSideStyled>
                        <Avatar/>
                        <FlexColumnAlignedStartStyled>
                            <UserNameStyled>{capitalizeStringFirstLetter(user.firstname)}</UserNameStyled>
                            <LogoutButtonStyled onClick={logoutUser}>Logout</LogoutButtonStyled>
                        </FlexColumnAlignedStartStyled>
                        <ColorModeButton/>

                        {showAddNoteButton && (
                            <AddButton
                                title="Add a new Note"
                                disable={disableAddNoteButton}
                                onClick={onAddNoteButtonClick}
                            />
                        )}
                    </RightNavbarSideStyled>}
            </NavbarWrapperContainerStyled>
        </NavbarContainerStyled>
    );
};

export default Navbar;
