import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {formatDateTime} from "@/utils/date";
import Avatar from "../../common/Avatar";
import * as S from "../styles";
import * as UserVersionS from "./styles";

const UserDetailsWithVersionMeta = ({
                                        firstname,
                                        lastname,
                                        avatarUrl,
                                        createdAt,
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
                        <>
                            Made by <S.NameHighlight>{firstname}</S.NameHighlight> {' '}
                            <S.NameHighlight>{lastname}</S.NameHighlight>
                        </>
                    }
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
