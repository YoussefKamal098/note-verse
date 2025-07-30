import React, {useEffect, useMemo} from 'react';
import styled from "styled-components";
import {IoIosGitPullRequest} from "react-icons/io";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import Modal from "@/components/modal";
import CommitMessage from "@/components/version/CommitMessage";
import DiffViewer from '@/components/diffViewer';
import useVersion from '@/hooks/useVersion';
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {useTheme} from "@/contexts/ThemeContext";

const Container = styled.div`
    padding: 10px 15px;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background-color: var(--color-background);
`;

const SelectedDiffModal = ({selectedDiff, onClose, onPull}) => {
    const {theme} = useTheme();
    const {notify} = useToastNotification();

    const {
        fetchContent,
        error,
        loading
    } = useVersion(selectedDiff?.id, false);

    useEffect(() => {
        error && notify.error(error);
    }, [error])

    const handlePull = async () => {
        const fullContent = await fetchContent();
        if (selectedDiff?.id && fullContent) {
            onPull?.({id: selectedDiff.id, content: fullContent});
        }
    };

    const diffs = useMemo(() => (
        {diff: selectedDiff?.diff}
    ), [selectedDiff?.diff]);

    return (
        <Modal
            isOpen={!!selectedDiff}
            onClose={onClose}
            width="90vw"
            height="90vh"
            disableBackdropClick={false}
        >
            {selectedDiff && (
                <Container>
                    <Button
                        type={BUTTON_TYPE.INFO}
                        onClick={handlePull}
                        loading={loading}
                        disabled={loading || !selectedDiff?.id}
                        style={{
                            fontSize: "0.9em",
                            width: "fit-content",
                            margin: "10px",
                        }}
                        Icon={IoIosGitPullRequest}
                    >
                        Pull
                    </Button>

                    <CommitMessage message={selectedDiff.message}/>

                    <DiffViewer
                        diffs={diffs}
                        theme={theme}
                        showToolbar={false}
                        showHeader={false}
                    />
                </Container>
            )}
        </Modal>
    );
};

export default React.memo(SelectedDiffModal);
