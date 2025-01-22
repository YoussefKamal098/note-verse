import React, {useEffect, useMemo, useState} from "react";
import {FaSearch} from "react-icons/fa";
import {IoClose} from "react-icons/io5";
import {debounce} from "lodash";
import {WidthTransitionContainer} from "../animations/ContainerAnimation";

import {
    IconWrapperStyled,
    InputStyled,
    SearchBarBoxStyled,
    SearchBarContainerStyled,
    SearchBarWrapperStyled,
} from "./SearchBarStyles";

const SEARCH_BAR_SEARCH_TEXT_STORED_KEY = "searchBarSearchText";

const SearchBar = ({onSearch = (value) => value}) => {
    const storedSearchText = localStorage.getItem(SEARCH_BAR_SEARCH_TEXT_STORED_KEY) || "";
    const [searchText, setSearchText] = useState(storedSearchText);
    const [value, setValue] = useState(searchText);

    useEffect(() => {
        setSearchText(value.trim());
        localStorage.setItem(SEARCH_BAR_SEARCH_TEXT_STORED_KEY, value);
    }, [value]);

    const debouncedSearch = useMemo(
        () =>
            debounce((value = "") => {
                if (onSearch) onSearch(value)
            }, 300),
        [onSearch]
    );

    const handleChange = (e) => {
        setValue(e.target.value)
    };

    const handleKeyUp = () => {
        debouncedSearch(searchText);
    };

    const handleClear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <SearchBarBoxStyled>
            <SearchBarWrapperStyled>
                <WidthTransitionContainer keyProp={"SearchBar"}>
                    <SearchBarContainerStyled>
                        <InputStyled
                            type="search"
                            placeholder="Search..."
                            value={value}
                            onChange={handleChange}
                            onKeyUp={handleKeyUp}
                        />
                        <IconWrapperStyled>
                            {value && (
                                <IoClose className="close-icon" onClick={handleClear}/>
                            )}
                            <FaSearch className="search-icon"/>
                        </IconWrapperStyled>
                    </SearchBarContainerStyled>
                </WidthTransitionContainer>
            </SearchBarWrapperStyled>
        </SearchBarBoxStyled>
    );
};

export default SearchBar;
