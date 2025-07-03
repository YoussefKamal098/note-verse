import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {formatDateTime} from "@/utils/date";
import Avatar from "../../common/Avatar";
import * as S from "../styles";
import * as UserContributionS from "./styles";

const UserDetailsWithContributions = ({
                                          firstname,
                                          lastname,
                                          avatarUrl,
                                          lastContributed,
                                          contributions,
                                      }) => {
    return (
        <UserContributionS.ContributionUserCard>
            <S.AvatarContainer>
                <Avatar avatarUrl={avatarUrl}/>
            </S.AvatarContainer>
            <UserContributionS.ContributionDetails>
                <S.UserName>
                    {firstname && lastname && `${firstname} ${lastname}`}
                    {contributions !== undefined && (
                        <UserContributionS.ContributionBadge>{contributions}</UserContributionS.ContributionBadge>
                    )}
                </S.UserName>
                <S.MetaInfo>
                    <UserContributionS.ContributionInfo>
                        {lastContributed && (
                            <UserContributionS.LastContribution>
                                Last contributed at
                                <S.NameHighlight>{formatDateTime(lastContributed)}</S.NameHighlight>
                            </UserContributionS.LastContribution>
                        )}
                    </UserContributionS.ContributionInfo>
                </S.MetaInfo>
            </UserContributionS.ContributionDetails>
        </UserContributionS.ContributionUserCard>
    );
};

export default React.memo(UserDetailsWithContributions);
