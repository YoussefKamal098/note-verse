import styled from "styled-components";
import {UserDetails} from "../styles"

export const VersionUserDetails = styled(UserDetails)`
    overflow: hidden;
`

export const CommitMessage = styled.div`
    font-size: 0.8em;
    font-weight: 600;
    color: var(--color-placeholder);
    max-width: 400px;
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
    margin-top: 5px;
`;

