import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaUsers} from "react-icons/fa";
import Avatar from '@/components/common/Avatar';
import Tooltip from "@/components/tooltip/Tooltip";
import noteService from "@/api/noteService";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Badge from "@/components/common/Badge";
import {useAuth} from "@/contexts/AuthContext";

const ContributorsContainer = styled.div`
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    gap: 5px;
`;

const ContributorsIcons = styled(FaUsers)`
    color: var(--color-primary);
    font-size: 0.9em;
`;

const Content = styled.div`
    display: flex;
    flex-wrap: nowrap;
    gap: 5px;
`;

const Contributors = styled.div`
    display: flex;
`;

const AvatarWrapper = styled.div`
    position: relative;
    z-index: ${({$order}) => $order};
    will-change: transform;
    width: 2.25em;
    height: 2.25em;
    border-radius: 50%;
    border: 2px solid var(--color-border);
    background: var(--color-background-primary);
    margin-left: -1em;
    transition: all 0.2s ease;
    font-weight: bold;
    overflow: hidden;
    cursor: pointer;

    &:first-child {
        margin-left: 0;
    }

    &:hover {
        box-shadow: var(--box-shadow-hoverable);
        transform: translateY(-2px) scale(1.1);
        z-index: 999 !important;
    }
`;

const SkeletonContainer = styled.div`
    display: flex;

    span .react-loading-skeleton {
        --base-color: var(--color-background-skeletonbase);
        --highlight-color: var(--color-background-skeletonhighlight);
        width: 2.25em;
        height: 2.25em;
        margin-left: -1em;
        border: 1px solid var(--color-border);
        border-radius: 50%;
        z-index: ${({$order}) => $order};
    }

    span:first-child .react-loading-skeleton {
        margin-left: 0;
    }
`;

const OverflowIndicator = styled.div`
    width: 2.25em;
    height: 2.25em;
    border-radius: 50%;
    background: var(--background-tertiary);
    color: var(--color-text);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: -1em;
    font-size: 0.75em;
    font-weight: bold;
    border: 1px solid var(--color-border);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
        background: var(--color-primary);
        color: var(--color-background-light);
        transform: translateY(-2px);
        box-shadow: var(--box-shadow-hoverable);
    }
`;

const Title = styled.h3`
    display: flex;
    align-items: center;
    gap: 5px;
    color: var(--color-text);
`;

const NoContributorsMessage = styled.div`
    color: var(--color-placeholder);
    opacity: 0.5;
    font-weight: 600;
    font-size: 0.9em;
`;

const TooltipTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
`

const ContributorsList = ({
                              noteId,
                              maxVisible = 5,
                              onAvatarClick
                          }) => {
    const {user} = useAuth();
    const {notify} = useToastNotification();
    const [isLoading, setIsLoading] = useState(true);
    const [contributorsData, setContributorsData] = useState({
        contributors: [],
        totalContributors: 0
    });

    const fetchContributors = useCallback(async () => {
        try {
            setIsLoading(true);
            const result = (await noteService.getContributors(noteId, {limit: maxVisible})).data;
            setContributorsData({
                contributors: result.contributors || [],
                totalContributors: result.totalContributors || 0
            });
        } catch (error) {
            notify.error('Failed to fetch contributors,', error.message);
        } finally {
            setIsLoading(false);
        }
    }, [noteId, maxVisible, notify]);

    useEffect(() => {
        fetchContributors();
    }, [fetchContributors]);

    const visibleContributors = contributorsData.contributors;
    const overflowCount = Math.max(0, contributorsData.totalContributors - maxVisible);

    return (
        <ContributorsContainer>
            <Title>
                Contributors
                <ContributorsIcons/>
            </Title>
            <Content>
                {isLoading ? (
                    <SkeletonContainer>
                        {Array.from({length: 7}).map((_, index) => (
                            <Skeleton
                                key={`loading-${index}`}
                                $order={5 - index}
                            />
                        ))}
                    </SkeletonContainer>
                ) : (
                    contributorsData.totalContributors > 0 ? (
                        <>
                            <Contributors>
                                {visibleContributors.map((contributor, index) => (
                                    <AvatarWrapper
                                        key={contributor.user.id}
                                        $order={visibleContributors.length - index}
                                        onClick={() => onAvatarClick?.(contributor.user.id)}
                                    >
                                        <Tooltip title={
                                            <TooltipTitle>
                                                {contributor.user.firstname} {contributor.user.lastname}
                                                {user.id === contributor.user.id &&
                                                    <Badge style={{fontSize: "0.75em"}} label={"you"}/>}
                                            </TooltipTitle>
                                        }>
                                            <Avatar avatarUrl={contributor.user.avatarUrl}/>
                                        </Tooltip>
                                    </AvatarWrapper>
                                ))}
                            </Contributors>
                            {!isLoading && overflowCount > 0 && (
                                <Tooltip title={`${overflowCount} more contributors`}>
                                    <OverflowIndicator onClick={() => onAvatarClick?.('overflow')}>
                                        +{overflowCount}
                                    </OverflowIndicator>
                                </Tooltip>
                            )}
                        </>
                    ) : (
                        <NoContributorsMessage>
                            No contributors yet
                        </NoContributorsMessage>
                    )
                )}
            </Content>
        </ContributorsContainer>
    );
};

export default React.memo(ContributorsList);
