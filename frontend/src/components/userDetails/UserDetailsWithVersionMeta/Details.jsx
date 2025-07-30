import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {formatDateTime} from "@/utils/date";
import Avatar from "../../common/Avatar";
import Badge from '@/components/common/Badge';
import * as S from "../styles";
import * as UserVersionS from "./styles";

const UserDetailsWithVersionMeta = ({
                                        firstname,
                                        lastname,
                                        avatarUrl,
                                        createdAt,
                                        showYouBadge = false,
                                        showOwnerBadge = false,
                                        commitMessage,
                                    }) => {
    return (
        <S.UserCard>
            <S.AvatarContainer>
                <Avatar avatarUrl={avatarUrl}/>
            </S.AvatarContainer>
            <UserVersionS.VersionUserDetails>
                <S.UserName>
                    {firstname && lastname &&
                        <div>
                            Made by <S.NameHighlight>{firstname}</S.NameHighlight> {' '}
                            <S.NameHighlight>{lastname}</S.NameHighlight>
                        </div>
                    }
                    {showYouBadge && <Badge label={"you"}/>}
                    {showOwnerBadge && <Badge label={"owner"}/>}
                </S.UserName>
                <S.MetaInfo>
                    {createdAt && formatDateTime(createdAt)}
                </S.MetaInfo>
                {commitMessage &&
                    <UserVersionS.CommitMessage>
                        {`"${commitMessage}"`}
                    </UserVersionS.CommitMessage>}
            </UserVersionS.VersionUserDetails>
        </S.UserCard>
    );
};

export default React.memo(UserDetailsWithVersionMeta);
