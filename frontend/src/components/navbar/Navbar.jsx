import React from "react";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import {useAuth} from "../../contexts/AuthContext";
import {useTheme} from "../../contexts/ThemeContext";
import SearchBar from "../searchBar/SearchBar";
import AddButton from "../buttons/AddButton";
import authService from "../../api/authService";
import {MdOutlineDarkMode, MdOutlineLightMode} from "react-icons/md";
import {capitalizeStringFirstLetter, getInitials} from "shared-utils/string.utils";

import {
    AvatarStyled,
    LeftNavbarSideStyled,
    NavbarContainerStyled,
    NavbarTitleStyled,
    NavbarWrapperContainerStyled,
    ProfileContainerStyled,
    RightNavbarSideStyled,
    UserInfoStyled
} from "./NavbarStyles";

const Navbar = ({
                    showSearch = false,
                    showAddNoteButton = false,
                    disableAddNoteButton = true,
                    onAddNoteButtonClick = () => ({}),
                    onSearch = (searchText) => searchText
                }) => {
    const {user} = useAuth();
    const {theme, setTheme} = useTheme();
    const navigate = useNavigate();

    const logoutUser = async () => {
        try {
            await authService.logout();
        } catch (error) {
            toast.error(`Error logout: ${error.message}`);
        }

        navigate("/login");
    };

    const onColorModeIconClick = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    }

    return (
        <NavbarContainerStyled>
            <NavbarWrapperContainerStyled className="container">
                <LeftNavbarSideStyled>
                    <NavbarTitleStyled>Notes</NavbarTitleStyled>
                    <div className="color-mode-icon" onClick={onColorModeIconClick}>
                        {theme === "dark" ? <MdOutlineDarkMode/> : <MdOutlineLightMode/>}
                    </div>
                </LeftNavbarSideStyled>

                {showSearch && <SearchBar onSearch={(searchText) => onSearch(searchText)}/>}

                {user && (
                    <RightNavbarSideStyled>
                        <ProfileContainerStyled>
                            <AvatarStyled>
                                {getInitials(user.firstname, user.lastname)}
                            </AvatarStyled>

                            <UserInfoStyled>
                                <p>{capitalizeStringFirstLetter(user.firstname)}</p>
                                <button onClick={logoutUser}>Logout</button>
                            </UserInfoStyled>
                        </ProfileContainerStyled>

                        {showAddNoteButton && (
                            <AddButton
                                title="Add a new Note"
                                disable={disableAddNoteButton}
                                onClick={onAddNoteButtonClick}
                            />
                        )}
                    </RightNavbarSideStyled>
                )}
            </NavbarWrapperContainerStyled>
        </NavbarContainerStyled>
    );
};

export default Navbar;
