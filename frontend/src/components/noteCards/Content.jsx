import React from 'react';
import {useNavigate} from "react-router-dom";
import {CardContent} from '@mui/material';
import '@uiw/react-markdown-preview/markdown.css';
import {MarkdownContainerStyles} from './Styles';
import Overlay from "../common/Overlay";
import PreviewTap from "@/components/noteMarkdownTabs/previewTab";
import routesPaths from "../../constants/routesPaths";

const contentStyles = {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
    padding: '0 !important',
    '&:after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        background: 'linear-gradient(to top, var(--color-background-primary), transparent)'
    }
};

const NoteCardContent = React.memo(({note}) => {
    const navigate = useNavigate();

    return (
        <CardContent sx={contentStyles}>
            <MarkdownContainerStyles onClick={() => navigate(routesPaths.NOTE(note.id))}>
                <Overlay isVisible={true} isAbsolute={true}/>
                <PreviewTap style={{padding: "0", fontSize: "0.6em"}}
                            content={note.content.slice(0, 1000) + (note.content.length > 1000 ? '...' : '')}/>
            </MarkdownContainerStyles>
        </CardContent>
    )
});

export default NoteCardContent;
