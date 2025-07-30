import React from "react";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css';
import * as S from "../styles";
import * as UserVersionS from "./styles";

const SkeletonLoading = () => {
    return (
        <S.UserCard>
            <S.AvatarContainer>
                <Skeleton
                    circle
                    width="2.5em"
                    height="2.5em"
                    baseColor="var(--color-background-skeletonbase)"
                    highlightColor="var(--color-background-skeletonhighlight)"
                />
            </S.AvatarContainer>

            <UserVersionS.VersionUserDetails>
                <S.UserName>
                    <Skeleton
                        width={160}
                        height={12}
                        baseColor="var(--color-background-skeletonbase)"
                        highlightColor="var(--color-background-skeletonhighlight)"
                        style={{marginBottom: 2}}
                    />
                </S.UserName>
                <S.MetaInfo>
                    <Skeleton
                        width={100}
                        height={10}
                        baseColor="var(--color-background-skeletonbase)"
                        highlightColor="var(--color-background-skeletonhighlight)"
                    />
                </S.MetaInfo>
                <UserVersionS.CommitMessage>
                    <Skeleton
                        width={180}
                        height={10}
                        baseColor="var(--color-background-skeletonbase)"
                        highlightColor="var(--color-background-skeletonhighlight)"
                        style={{marginTop: 5}}
                    />
                </UserVersionS.CommitMessage>
            </UserVersionS.VersionUserDetails>
        </S.UserCard>
    );
};

export default React.memo(SkeletonLoading);
