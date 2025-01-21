import styled, {css} from "styled-components";

const NavbarContainerStyled = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    font-size: 0.9em;
    background-color: var(--color-background);
    border-bottom: calc(var(--border-width) / 2) solid var(--color-border);
    box-shadow: var(--box-shadow);
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

const NavbarLogoStyled = styled.h2`
    margin-right: 0.25em;
    font-size: 1.75em;
    font-weight: 600;
    font-family: "Pacifico", cursive;
    color: var(--color-accent);
    user-select: none;
`;

const sharedNavbarSideStyles = css`
    display: flex;
    align-items: center;
    background-color: var(--color-background);
    gap: 0.5em;
`;

const LeftNavbarSideStyled = styled.div`
    ${sharedNavbarSideStyles}
`;

const MiddleNavbarSideStyled = styled.div`
    max-width: calc(100% / 3);
    ${sharedNavbarSideStyles} ;
`;

const RightNavbarSideStyled = styled.div`
    ${sharedNavbarSideStyles};
`;

const FlexColumnAlignedStartStyled = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const UserNameStyled = styled.p`
    font-size: 1em;
    font-weight: bold;
    color: var(--color-placeholder);
    margin: 0;
`;

const LogoutButtonStyled = styled.button`
    font-size: 0.875em;
    font-weight: 600;
    color: var(--color-accent);
    text-decoration: none;
    cursor: pointer;
    padding: 0;

    &:hover {
        text-decoration: underline;
    }
`;

export {
    NavbarContainerStyled,
    NavbarWrapperContainerStyled,
    NavbarLogoStyled,
    LeftNavbarSideStyled,
    RightNavbarSideStyled,
    MiddleNavbarSideStyled,
    FlexColumnAlignedStartStyled,
    UserNameStyled,
    LogoutButtonStyled
};
