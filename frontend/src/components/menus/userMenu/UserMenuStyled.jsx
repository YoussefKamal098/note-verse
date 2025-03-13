import styled from "styled-components";
import {appearKeyframesMobile, MenuContainerStyled} from "../MenuStyled"

const AvatarStyled = styled.div`
    position: relative;
    width: 2.25em;
    height: 2.25em;
    min-width: 2.25em;
    min-height: 2.25em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: calc(var(--border-width) / 2) solid var(--color-border);
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-placeholder);
    font-size: 1.25em;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
`;

const BarsContainerStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 35px;
    height: 35px;
    cursor: pointer;
`;

const MenuBarsStyled = styled.div`
    position: relative;
    width: 20px;
    height: 3px;
    border-radius: 25px;
    transition: all 300ms ease;
    background-color: var(--color-placeholder);

    &::before,
    &::after {
        content: "";
        position: absolute;
        height: 3px;
        width: 100%;
        background-color: var(--color-placeholder);
        border-radius: 25px;
        transition: all 300ms ease;
        right: 5px;
    }

    &::before {
        top: -8px;
    }

    &::after {
        bottom: -8px;
    }

    &.open {
        background-color: transparent;
    }

    &.open::before {
        transform: translateY(8px) rotate(45deg);
        width: 100%;
    }

    &.open::after {
        transform: translateY(-8px) rotate(-45deg);
        width: 100%;
    }
`;

const MenuCloseButtonContainerStyled = styled.div`
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 25px;
    height: 25px;
    cursor: pointer;
`

const CloseButtonStyled = styled.button`
    height: 0;
    border-radius: 25px;
    cursor: pointer;

    &::before,
    &::after {
        content: "";
        position: absolute;
        height: 3px;
        width: 100%;
        left: 0;
        background-color: var(--color-placeholder);
        border-radius: 25px;
        transition: all 300ms ease;
    }

    &::before {
        transform: rotate(45deg);
    }

    &::after {
        transform: rotate(-45deg);
    }

    &.close::before,
    &.close::after {
        transform: rotate(0);
    }

    @media (max-width: 768px) {
        display: flex;
    }
`;

const UserMenuAvatarStyled = styled(AvatarStyled)`
    font-size: 1.75em;
`;

const UserMenuContainerStyled = styled(MenuContainerStyled)`
    /* Use mobileSize from props passed in */
    @media (max-width: ${props => props.mobile_size}px) {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        min-width: 100vw;
        max-height: 100vh;
        translate: 0 0;
        border-radius: 0;
        padding: 2.5em 1em 2em;
        box-shadow: none;
        animation: ${appearKeyframesMobile} 300ms ease-out;
        overflow-y: auto;

        &.menu-enter {
            transform: translateY(0);
        }

        &.menu-exit-active {
            transform: translateY(0);
        }
    }
`;

const HeaderStyled = styled.div`
    display: flex;
    align-items: center;
    border-bottom: calc(var(--border-width) / 2) solid var(--color-border);
    padding-bottom: 1em;
    margin: 0 1em;
    gap: 0.5em;
`;

const FullNameStyled = styled.div`
    font-size: 1.5em;
    font-weight: 600;
`;

const AppearanceMenuStyled = styled.div`
    position: absolute;
    min-width: 300px;
    translate: -100% -10px;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 1em;
    padding: 1em 0;
    background-color: var(--color-background);
    border-radius: var(--border-radius);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    z-index: 999;
    cursor: default;
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 300ms ease, transform 300ms ease, max-height 500ms ease;
    pointer-events: none;
    overflow: hidden;

    .appearance-wrapper:hover & {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
    }

    @media (max-width: ${props => props.mobile_size}px) {
        position: relative;
        left: 25px;
        top: 0;
        width: calc(100% - 50px);
        max-width: calc(100% - 50px);
        max-height: ${({is_open}) => (is_open ? "400px" : "0")};
        padding: 0;
        translate: 0 0;
        opacity: 1;
        transform: none;
        box-shadow: none;
    }
`;

export {
    AvatarStyled,
    BarsContainerStyled,
    MenuBarsStyled,
    MenuCloseButtonContainerStyled,
    CloseButtonStyled,
    UserMenuAvatarStyled,
    HeaderStyled,
    FullNameStyled,
    UserMenuContainerStyled,
    AppearanceMenuStyled
};
