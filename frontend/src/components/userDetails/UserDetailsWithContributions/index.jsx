import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {formatDateTime} from "@/utils/date";
import Avatar from "../../common/Avatar";
import * as S from "../styles";
import * as UserContributionS from "./styles";
import Badge from "@/components/common/Badge";

const UserDetailsWithContributions = ({
                                          firstname,
                                          lastname,
                                          avatarUrl,
                                          showYouBadge = false,
                                          showOwnerBadge = false,
                                          lastContributed,
                                          contributions
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
                    {showYouBadge && <Badge label={"you"}/>}
                    {showOwnerBadge && <Badge label={"owner"}/>}
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
