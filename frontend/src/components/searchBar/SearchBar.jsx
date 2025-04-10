import React, {useEffect, useMemo, useState} from "react";
import {FaSearch} from "react-icons/fa";
import {IoClose} from "react-icons/io5";
import {debounce} from "lodash";
import usePersistedState from "../../hooks/usePersistedState";
import {WidthTransitionContainer} from "../animations/ContainerAnimation";

import {
    IconWrapperStyled,
    InputStyled,
    SearchBarBoxStyled,
    SearchBarContainerStyled,
    SearchBarWrapperStyled,
} from "./SearchBarStyles";

const SearchBar = ({onSearch = (value) => value}) => {
    const [searchText, setSearchText] = usePersistedState("search_text", "");
    const [value, setValue] = useState(searchText);

    useEffect(() => {
        setSearchText(value.trim());
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
