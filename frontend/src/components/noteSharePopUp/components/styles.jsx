import styled from "styled-components";
import {MdPublic, MdVpnLock} from "react-icons/md";

const SectionStyles = styled.div`
    padding: 1rem 0;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
        border-bottom: none;
    }
`;

const SectionTitleStyles = styled.h4`
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--color-placeholder);
`;

const PublicIconStyles = styled(MdPublic)`
    font-size: 1.75em;
    color: var(--color-placeholder);
`;

const PrivateIconStyles = styled(MdVpnLock)`
    font-size: 1.75em;
    color: var(--color-placeholder);
`;

export {
    SectionTitleStyles,
    SectionStyles,
    PublicIconStyles,
    PrivateIconStyles
}
