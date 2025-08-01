import React from "react";
import "react-loading-skeleton/dist/skeleton.css";
import {formatSocialDate} from "@/utils/date";
import Avatar from "../../common/Avatar";
import * as S from "../styles";
import * as UserNoteS from "./styles";

const UserDetailsWithNoteMeta = ({
                                     firstname,
                                     lastname,
                                     avatarUrl,
                                     createdAt,
                                     isPublic = false,
                                     isOnline = false,
                                 }) => {
    return (

        <S.UserCard>
            <S.AvatarContainer $isOnline={isOnline}>
                <Avatar avatarUrl={avatarUrl}/>
            </S.AvatarContainer>
            <S.UserDetails>
                <S.UserName>
                    {firstname && lastname && `${firstname} ${lastname}`}
                </S.UserName>
                <S.MetaInfo>
                    {createdAt && (
                        <>
                            {formatSocialDate(createdAt)} .
                            {isPublic ? <UserNoteS.PublicIcon/> :
                                <UserNoteS.PrivateIcon/>}
                        </>
                    )}
                </S.MetaInfo>
            </S.UserDetails>
        </S.UserCard>
    );
};

export default React.memo(UserDetailsWithNoteMeta);
