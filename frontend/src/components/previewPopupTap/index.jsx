import React, {Suspense, useMemo} from 'react';
import {HiOutlineWrenchScrewdriver} from "react-icons/hi2";
import {FcReadingEbook} from "react-icons/fc";
import {AnimatedTabSwitch} from "@/components/animations/ContainerAnimation";
import PopUpTap from '@/components/popUpTap';
import Loader from "@/components/common/Loader";
import styled from "styled-components";

const PreviewTab = React.lazy(() => import("../noteMarkdownTabs/PreviewTab"));
const EditorTab = React.lazy(() => import("../noteMarkdownTabs/EditorTab"));

const BookIcon = styled(FcReadingEbook)`
    font-size: 0.9em;
    color: var(--color-primary);
`;

const PreviewPopupTap = ({
                             content,
                             onClose,
                             isOpen,
                             isLoading = true
                         }) => {

    const [contentTabActive, setContentTabTabActive] = React.useState(false);

    const headerButtons = useMemo(() => ([
        {
            action: () => setContentTabTabActive((prev) => !prev),
            title: "Editor",
            icon: <HiOutlineWrenchScrewdriver/>,
            active: contentTabActive,
        }
    ]), [contentTabActive])

    return (
        <PopUpTap
            title="Preview"
            titleIcon={<BookIcon/>}
            content={content}
            onClose={onClose}
            isOpen={isOpen}
            isLoading={isLoading}
            headerButtons={headerButtons}
        >
            <AnimatedTabSwitch isActive={contentTabActive}>
                <div key={contentTabActive ? 'editor-tab' : 'preview-tab'}>
                    <Suspense fallback={<Loader isAbsolute={true}/>}>
                        {contentTabActive ? (
                            <EditorTab
                                content={content}
                                showToolbar={false}
                                disable={true}
                            />
                        ) : (
                            <PreviewTab
                                content={content}
                            />
                        )}
                    </Suspense>
                </div>
            </AnimatedTabSwitch>

        </PopUpTap>
    );
};

export default React.memo(PreviewPopupTap);
