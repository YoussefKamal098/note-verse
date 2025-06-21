import React from "react";
import styled from 'styled-components';
import {useNavigate} from "react-router-dom";
import {IoMdArrowRoundBack} from "react-icons/io";
import Tooltip from "../tooltip/Tooltip";

const BackHomeStyled = styled.div`
    width: 35px;
    min-width: 35px;
    height: 35px;
    min-height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    color: var(--color-text);
    border-radius: 50%;
    transition: background-color 0.3s, transform 0.3s;
    cursor: pointer;

    &:hover {
        background-color: var(--color-background-secondary);
    }

    &:active {
        transform: scale(0.9);
    }
`

const BackHomeButton = () => {
    const navigate = useNavigate();

    return (
        <Tooltip title={"Back"}>
            <BackHomeStyled>
                <IoMdArrowRoundBack onClick={() => navigate(-1)}> </IoMdArrowRoundBack>
            </BackHomeStyled>
        </Tooltip>

    )
}

export default React.memo(BackHomeButton);
