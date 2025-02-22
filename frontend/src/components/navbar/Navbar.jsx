import React, {Suspense} from "react";
import {useGlobalSettings} from '../../contexts/GlobalSettingsContext';
import {useAuth} from "../../contexts/AuthContext";
import SearchBar from "../searchBar/SearchBar";
import Loader from '../common/Loader';

import {
    LeftNavbarSideStyled,
    MiddleNavbarSideStyled,
    NavbarContainerStyled,
    NavbarLogoStyled,
    NavbarWrapperContainerStyled,
    RightNavbarSideStyled
} from "./NavbarStyles";

const UserMenu = React.lazy(() => import("../menus/userMenu/UserMenu"));

const Navbar = ({
                    showSearch = false,
                    onSearch = (searchText) => searchText
                }) => {
    const {navbarPosition} = useGlobalSettings();
    const {user} = useAuth();

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
                        <Suspense fallback={<Loader/>}>
                            <UserMenu/>
                        </Suspense>
                    </RightNavbarSideStyled>}
            </NavbarWrapperContainerStyled>
        </NavbarContainerStyled>
    );
};

export default Navbar;
