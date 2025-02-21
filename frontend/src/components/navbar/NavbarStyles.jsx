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
    ${sharedNavbarSideStyles} ;
`;

const RightNavbarSideStyled = styled.div`
    ${sharedNavbarSideStyles};
`;

export {
    NavbarContainerStyled,
    NavbarWrapperContainerStyled,
    NavbarLogoStyled,
    LeftNavbarSideStyled,
    RightNavbarSideStyled,
    MiddleNavbarSideStyled,
};
