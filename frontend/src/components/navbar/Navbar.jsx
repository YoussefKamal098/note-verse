import React from "react";
import {useAuth} from "../../contexts/AuthContext";
import SearchBar from "../searchBar/SearchBar";
import UserMenu from "../menus/userMenu";

import {
    LeftNavbarSideStyled,
    MiddleNavbarSideStyled,
    NavbarContainerStyled,
    NavbarLogoStyled,
    NavbarWrapperContainerStyled,
    RightNavbarSideStyled
} from "./NavbarStyles";


const Navbar = ({
                    showSearch = false,
                    onSearch = (searchText) => searchText
                }) => {
    const {user} = useAuth();

    return (
        <NavbarContainerStyled>
            <NavbarWrapperContainerStyled className="container">
                <LeftNavbarSideStyled>
                    <NavbarLogoStyled>Notes</NavbarLogoStyled>
                </LeftNavbarSideStyled>

                <MiddleNavbarSideStyled>
                    {showSearch && user && <SearchBar onSearch={(searchText) => onSearch(searchText)}/>}
                </MiddleNavbarSideStyled>

                {user && <RightNavbarSideStyled>
                    <UserMenu/>
                </RightNavbarSideStyled>}
            </NavbarWrapperContainerStyled>
        </NavbarContainerStyled>
    );
};

export default React.memo(Navbar);
