import styled from "styled-components";
import * as S from "../styles";

export const ContributionUserCard = styled(S.UserCard)`
    padding-bottom: 15px;
`;

export const ContributionDetails = styled(S.UserDetails)`
    gap: 10px;
`;

export const ContributionBadge = styled.span`
    width: fit-content;
    background: var(--color-primary);
    color: var(--color-background-light);
    padding: 2px 5px;
    border-radius: 10px;
    font-size: 0.75em;
    font-weight: 600;
    margin-left: 5px;
`;

export const ContributionInfo = styled.span`
    display: flex;
    flex-direction: column;
    gap: 5px;
`;

export const LastContribution = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`;
