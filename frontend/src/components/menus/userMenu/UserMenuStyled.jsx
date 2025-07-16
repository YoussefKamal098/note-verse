import styled from "styled-components";

const AvatarStyled = styled.div`
    position: relative;
    width: 2.25em;
    height: 2.25em;
    min-width: 2.25em;
    min-height: 2.25em;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--color-border);
    border-radius: 50%;
    background-color: var(--color-background-secondary);
    color: var(--color-placeholder);
    font-size: 1.25em;
    font-weight: bold;
    cursor: pointer;
    user-select: none;
    overflow: hidden;
`;

const UserMenuAvatarStyled = styled(AvatarStyled)`
    font-size: 1.75em;
`;

const HeaderStyled = styled.div`
    display: flex;
    align-items: center;
    border-bottom: 2px solid var(--color-border);
    padding-bottom: 1em;
    padding-right: 2em;
    gap: 0.5em;
`;

const FullNameStyled = styled.div`
    font-size: 1.5em;
    font-weight: 600;
    text-wrap: nowrap;
`;

export {
    AvatarStyled,
    UserMenuAvatarStyled,
    HeaderStyled,
    FullNameStyled
};
