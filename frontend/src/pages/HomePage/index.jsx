import React, {useCallback} from "react";
import PageLayout from "@/layouts/PageLayout";
import NoteCards from "@/components/notesGrid";
import Loader from "@/components/common/Loader";
import LoadMoreButton from "@/components/buttons/LoadMoreButton";
import NoNotes from "./NoNotes";
import usePaginatedNotes from "@/hooks/usePaginatedNotes";
import usePersistedState from "@/hooks/usePersistedState";
import AppConfig from "@/config/config";
import styled from "styled-components";

export const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    margin: 1.25rem;
`;

const HomePage = () => {
    const [searchText, setSearchText] = usePersistedState("homeSearchText", "");

    const {notes, loading, nextCursor, loadNext} = usePaginatedNotes({
        searchText,
        limit: AppConfig.NOTES_PER_PAGE,
    });

    const handleSearch = useCallback((text) => {
        setSearchText(text);
    }, [setSearchText]);

    return (
        <PageLayout showSearch onSearch={handleSearch}>
            <Container>
                <NoteCards notes={notes}/>

                {notes.length === 0 && !loading && <NoNotes/>}
                {notes.length === 0 && loading && <Loader/>}

                {nextCursor && (
                    <LoadMoreButton
                        onClick={loadNext}
                        loading={loading}
                    >
                        Load more
                    </LoadMoreButton>
                )}
            </Container>
        </PageLayout>
    );
};

export default HomePage;
