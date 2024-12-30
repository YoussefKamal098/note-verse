import styled from "styled-components";

const NavbarContainerStyled = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    font-size: 0.9em;
    background-color: var(--color-background);
    box-shadow: var(--box-shadow);
    border-bottom: calc(var(--border-width) / 2) solid var(--color-border);
    z-index: 888;
`;

const NavbarWrapperContainerStyled = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5em 1.5em;
    margin-bottom: 0.5em;
    gap: 1em;
`;

const NavbarTitleStyled = styled.h2`
    margin-right: 0.25em;
    font-size: 1.75em;
    font-weight: 600;
    font-family: "Pacifico", cursive;
    color: var(--color-accent);
`;

const RightNavbarSideStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5em;
`;

const ProfileContainerStyled = styled.div`
    display: flex;
    align-items: center;
    gap: 0.75em;
`;

const AvatarStyled = styled.div`
    width: 2.5em;
    height: 2.5em;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-text);
    font-size: 1.25em;
    font-weight: bold;
`;

const UserInfoStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    p {
        font-size: 1em;
        font-weight: bold;
        color: var(--color-placeholder);
        margin: 0;
    }

    button {
        font-size: 0.875em;
        font-weight: 600;
        color: var(--color-accent);
        text-decoration: none;
        cursor: pointer;
        padding: 0;
    }

    button:hover {
        text-decoration: 0.1em underline;
    }
`;

export {
    NavbarContainerStyled,
    NavbarWrapperContainerStyled,
    NavbarTitleStyled,
    RightNavbarSideStyled,
    ProfileContainerStyled,
    AvatarStyled,
    UserInfoStyled,
};
