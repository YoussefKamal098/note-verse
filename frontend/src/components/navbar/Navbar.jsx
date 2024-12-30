import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import SearchBar from "../searchBar/SearchBar";
import AddNoteButton from "../notes/AddNoteButton";
import authService from "../../api/authService";
import { getInitials, capitalizeStringFirstLetter } from "../../utils";

import {
    NavbarContainerStyled,
    NavbarWrapperContainerStyled,
    NavbarTitleStyled,
    RightNavbarSideStyled,
    ProfileContainerStyled,
    AvatarStyled,
    UserInfoStyled
} from "./NavbarStyles";

const Navbar = ({
                    showSearch = false,
                    showAddNoteButton = false,
                    disableAddNoteButton = true,
                    onAddNoteButtonClick = () => {},
                    onSearch = (searchText) => searchText
                }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const logoutUser = async () => {
        const result = await authService.logout();
        if (result.statusCode !== 204) {
            toast.error(`Error logout: ${result.message}` || "An error occurred. Please try again.");
            return;
        }

        navigate("/login");
    };

    return (
        <NavbarContainerStyled>
            <NavbarWrapperContainerStyled className="container">
                <NavbarTitleStyled>Notes</NavbarTitleStyled>
                {showSearch && <SearchBar onSearch={(searchText) => onSearch(searchText)} />}
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
                            <AddNoteButton
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
