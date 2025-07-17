import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {AnimatedListWidthChildrenFade} from "@/components/animations/ContainerAnimation"
import LoadingEffect from '@/components/common/LoadingEffect';
import Loader from '@/components/common/Loader';
import {useToastNotification} from "@/contexts/ToastNotificationsContext";

const ScrollContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    flex: 1;
    min-height: 0;
    overflow-y: auto;
`;

const LoaderWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 25px 0;
`;

const EndMessage = styled.div`
    text-align: center;
    font-weight: 600;
    padding: 10px;
    color: var(--color-placeholder);
`;


const InfiniteScrollLoader = ({
                                  fetchData,          // Function that fetches data (should return Promise)
                                  renderItem,         // Function to render each item (item) => JSX
                                  pageSize = 10,      // Items per page
                                  threshold = 100,    // Scroll threshold for loading more
                                  endMessage = "No more items to load",
                                  emptyListMessage = "No items to load.",
                                  loader = (<LoaderWrapper>
                                      <LoadingEffect color="var(--color-primary)" size={25}/>
                                  </LoaderWrapper>),
                                  initLoader = <Loader isAbsolute={true} size={30} color={"var(--color-primary)"}/>,
                                  initItems = [],
                                  initPage = 0,
                                  onChange,
                                  containerStyle = {},
                                  ...props
                              }) => {
    const {notify} = useToastNotification();
    const [items, setItems] = useState(initItems);
    const [page, setPage] = useState(initPage);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(initItems.length === 0);
    const containerRef = useRef(null);

    useEffect(() => {
        if (page === 0 && items.length === 0) {
            setHasMore(true);
            setHasInitialLoad(true);
        }
    }, [page, items]);

    useEffect(() => {
        setItems(initItems);
        setPage(initPage);
    }, [initPage, initItems]);

    const loadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        try {
            const newItems = await fetchData(page, pageSize);
            if (newItems.length === 0) {
                setHasMore(false);
            } else {
                const updatedItems = [...items, ...newItems];
                setItems(updatedItems);
                setPage(page + 1);
                onChange && onChange(updatedItems, page + 1);
            }
        } catch (error) {
            notify.error('Error loading items,', error.message);
        } finally {
            setIsLoading(false);
            if (hasInitialLoad) setHasInitialLoad(false);
        }
    };

    const handleScroll = () => {
        if (!containerRef.current || isLoading || !hasMore) return;

        const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < threshold;

        if (isNearBottom) {
            loadMore();
        }
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore]);

    useEffect(() => {
        if (hasInitialLoad && initItems.length === 0) {
            loadMore();
        }
    }, [hasInitialLoad, initItems.length, loadMore]);

    return (
        <ScrollContainer
            ref={containerRef}
            style={containerStyle}
            {...props}
        >
            <AnimatedListWidthChildrenFade delayAfter={items.length - pageSize}>
                {items.map(item => renderItem(item))}
            </AnimatedListWidthChildrenFade>
            {isLoading && !hasInitialLoad && loader}
            {!isLoading && items.length === 0 && <EndMessage>{emptyListMessage}</EndMessage>}
            {!hasMore && !isLoading && items.length !== 0 && <EndMessage>{endMessage}</EndMessage>}
            {hasInitialLoad && isLoading && initLoader}
        </ScrollContainer>
    );
};

export default React.memo(InfiniteScrollLoader);
