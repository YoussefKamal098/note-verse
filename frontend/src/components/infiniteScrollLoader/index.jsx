import React, {useEffect, useRef, useState} from "react";
import styled from 'styled-components';
import {AnimatedListWidthChildrenFade} from "@/components/animations/ContainerAnimation";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import LoadingEffect from '@/components/common/LoadingEffect';
import Loader from '@/components/common/Loader';

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

const ErrorWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 25px 0;
`;

const ErrorMessage = styled.div`
    color: var(--color-danger);
    font-size: 0.8em;
    font-weight: 600;
    text-align: center;
`;

const EndMessage = styled.div`
    text-align: center;
    font-weight: 600;
    padding: 10px;
    color: var(--color-placeholder);
`;

const InfiniteScrollLoader = ({
                                  fetchData,
                                  renderItem,
                                  pageSize = 10,
                                  threshold = 100,
                                  endMessage = "No more items to load",
                                  emptyListMessage = "No items to load.",
                                  loader = (
                                      <LoaderWrapper>
                                          <LoadingEffect color="var(--color-primary)" size={25}/>
                                      </LoaderWrapper>
                                  ),
                                  initLoader = <Loader isAbsolute={true} size={30} color={"var(--color-primary)"}/>,
                                  initItems = [],
                                  initPage = 0,
                                  initCursor = null,
                                  useCursor = false,
                                  onChange,
                                  containerStyle = {},
                                  ...props
                              }) => {
    const [items, setItems] = useState(initItems);
    const [page, setPage] = useState(initPage);
    const [cursor, setCursor] = useState(initCursor);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [hasInitialLoad, setHasInitialLoad] = useState(initItems.length === 0);
    const [error, setError] = useState(null);
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
        setError(null);
    }, [initPage, initItems]);

    const loadMore = async () => {
        if (!hasMore || isLoading) return;

        setIsLoading(true);
        setError(null);
        try {
            if (useCursor) {
                // Cursor-based pagination
                const response = await fetchData(pageSize, cursor);
                const newItems = response.data || [];
                const nextCursor = response.nextCursor || null;

                if (newItems.length !== 0) {
                    const updatedItems = [...items, ...newItems];
                    setItems(updatedItems);
                    setCursor(nextCursor);
                    onChange?.(newItems, cursor);
                }

                if (!nextCursor) {
                    setHasMore(false);
                }
            } else {
                const newItems = await fetchData(page, pageSize);
                if (newItems.length === 0) {
                    setHasMore(false);
                } else {
                    const updatedItems = [...items, ...newItems];
                    setItems(updatedItems);
                    setPage(page + 1);
                    onChange?.(updatedItems, page + 1);
                }
            }

            if (hasInitialLoad) setHasInitialLoad(false);
        } catch (error) {
            setError(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => loadMore();

    const handleScroll = () => {
        if (!containerRef.current || isLoading || !hasMore || error) return;

        const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
        const isNearBottom = scrollHeight - (scrollTop + clientHeight) < threshold;

        isNearBottom && loadMore();
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [isLoading, hasMore, error]);

    useEffect(() => {
        if ((hasInitialLoad && initItems.length === 0) ||
            (initItems.length < pageSize && hasMore)
        ) {
            loadMore();
        }
    }, [hasInitialLoad, initItems.length]);

    const renderErrorState = () => (
        <ErrorWrapper>
            <Button
                onClick={handleRetry}
                type={BUTTON_TYPE.INFO}
                style={{fontSize: "0.75em"}}
            >
                Try Again
            </Button>
            <ErrorMessage>Failed to load items. Please try again.</ErrorMessage>
        </ErrorWrapper>
    );

    return (
        <ScrollContainer
            ref={containerRef}
            style={containerStyle}
            {...props}
        >
            <AnimatedListWidthChildrenFade delayAfter={items.length - pageSize}>
                {items.map(item => renderItem(item))}
            </AnimatedListWidthChildrenFade>

            {!isLoading && error && renderErrorState()}
            {isLoading && !hasInitialLoad && !error && loader}
            {!isLoading && items.length === 0 && !error && <EndMessage>{emptyListMessage}</EndMessage>}
            {!hasMore && !isLoading && items.length !== 0 && !error && <EndMessage>{endMessage}</EndMessage>}
            {hasInitialLoad && isLoading && !error && initLoader}
        </ScrollContainer>
    );
};

export default React.memo(InfiniteScrollLoader);
