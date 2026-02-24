import React, {useCallback} from "react";
import {FaSearch} from "react-icons/fa";
import {IoClose} from "react-icons/io5";
import usePersistedState from "../../hooks/usePersistedState";
import {WidthTransitionContainer} from "../animations/ContainerAnimation";
import {
    IconButtonStyled,
    InputStyled,
    SearchBarBoxStyled,
    SearchBarContainerStyled,
    SearchBarWrapperStyled,
} from "./SearchBarStyles";

const SearchBar = ({onSearch = (value) => value}) => {
    const [value, setValue] = usePersistedState("search_text", "");

    const handleSearch = useCallback(async () => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        return await onSearch(trimmedValue);
    }, [value, onSearch]);

    const handleChange = (e) => setValue(e.target.value);

    const handleKeyUp = (e) => {
        if (e.key === "Enter") handleSearch();
    };

    const handleClear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <SearchBarBoxStyled>
            <SearchBarWrapperStyled>
                <WidthTransitionContainer keyProp="SearchBar">
                    <SearchBarContainerStyled>
                        <InputStyled
                            type="search"
                            placeholder="Search..."
                            value={value}
                            onChange={handleChange}
                            onKeyUp={handleKeyUp}
                            aria-label="Search input"
                        />

                        {value && (
                            <IconButtonStyled
                                type="button"
                                onClick={handleClear}
                                className="clear"
                                aria-label="Clear search"
                            >
                                <IoClose/>
                            </IconButtonStyled>
                        )}

                        <IconButtonStyled
                            type="button"
                            onClick={handleSearch}
                            disabled={!value.trim()}
                            className="search"
                            aria-label="Search"
                        >
                            <FaSearch/>
                        </IconButtonStyled>
                    </SearchBarContainerStyled>
                </WidthTransitionContainer>
            </SearchBarWrapperStyled>
        </SearchBarBoxStyled>
    );
};

export default SearchBar;
