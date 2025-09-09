import React from "react";
import {useAuth} from "@/contexts/AuthContext";
import SearchBar from "../searchBar/SearchBar";
import UserMenu from "../menus/userMenu";
import RealTimeNotification from "@/components/notifications/realTimeNotification";

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
                    <NavbarLogoStyled>NoteVerse</NavbarLogoStyled>
                </LeftNavbarSideStyled>

                <MiddleNavbarSideStyled>
                    {showSearch && user && <SearchBar onSearch={(searchText) => onSearch(searchText)}/>}
                </MiddleNavbarSideStyled>

                {user && <RightNavbarSideStyled>
                    <RealTimeNotification/>
                    <UserMenu/>
                </RightNavbarSideStyled>}
            </NavbarWrapperContainerStyled>
        </NavbarContainerStyled>
    );
};

export default React.memo(Navbar);
