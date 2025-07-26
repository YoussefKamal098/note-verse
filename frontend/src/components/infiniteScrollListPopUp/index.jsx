import React, {forwardRef, useCallback, useImperativeHandle, useState} from 'react';
import styled from 'styled-components';
import InfiniteScrollLoader from "@/components/infiniteScrollLoader";
import CloseButton from "@/components/buttons/CloseButton";
import Modal from "@/components/modal";

const ListContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    padding: 20px 15px 30px;
    background-color: var(--color-background);
`;

const ListHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap-reverse;
    margin-bottom: 15px;
`;

const ListTitle = styled.div`
    display: flex;
    flex-direction: ${({$flexDirection}) => $flexDirection};
    align-items: center;
    gap: 5px;
    font-size: 1.5em;
    font-weight: 600;
    text-wrap: nowrap;
    color: var(--color-text);

`;

const Icon = styled.div`
    display: inline-flex;
    font-size: 0.75em;
    color: var(--color-primary);
`

const InfiniteScrollList = forwardRef(({
                                           isOpen,
                                           onClose,
                                           title,
                                           icon,
                                           iconLeft = false,
                                           fetchData,
                                           renderItem,
                                           width = "90vw",
                                           height = "90vh",
                                           maxWidth = "450px",
                                           maxHeight = "750px",
                                           threshold = 10,
                                           endMessage = "No more items to load",
                                           onChange
                                       }, ref) => {
    const [page, setPage] = useState(0);
    const [items, setItems] = useState([]);

    const handleOnChange = useCallback((newItems, newPage) => {
        setItems(newItems);
        setPage(newPage);
        onChange?.(newItems, newPage);
    }, []);

    useImperativeHandle(ref, () => ({
        resetData: () => {
            setPage(0);
            setItems([]);
        }
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            width={width}
            height={height}
            maxWidth={maxWidth}
            maxHeight={maxHeight}
        >
            <ListContainer>
                <ListHeader>
                    <ListTitle $flexDirection={iconLeft ? "row-reverse" : "row"}>
                        {title}
                        <Icon>{icon}</Icon>
                    </ListTitle>
                    <CloseButton onClick={onClose}/>
                </ListHeader>
                <InfiniteScrollLoader
                    fetchData={fetchData}
                    renderItem={renderItem}
                    initPage={page}
                    initItems={items}
                    threshold={threshold}
                    endMessage={endMessage}
                    onChange={handleOnChange}
                />
            </ListContainer>
        </Modal>
    );
});

export default React.memo(InfiniteScrollList);
