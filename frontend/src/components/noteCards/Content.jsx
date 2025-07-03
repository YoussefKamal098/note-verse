import React from 'react';
import {useNavigate} from "react-router-dom";
import {CardContent} from '@mui/material';
import MarkdownPreview from '@uiw/react-markdown-preview';
import '@uiw/react-markdown-preview/markdown.css';
import {motion} from 'framer-motion';
import {MarkdownContainerStyles} from './Styles';
import Overlay from "../common/Overlay";
import {useTheme} from "@/contexts/ThemeContext"
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

const MarkdownComponent = React.memo(({content}) => {
    const {theme} = useTheme();

    return (
        <div data-color-mode={theme}>
            <MarkdownPreview
                source={content.slice(0, 1000) + (content.length > 1000 ? '...' : '')}
                style={{
                    backgroundColor: 'transparent',
                    fontFamily: '"Poppins", sans-serif !important',
                    fontSize: '10px',
                    fontWeight: "600",
                    lineHeight: 1.25,
                    maxHeight: '100%',
                    overflow: 'hidden',
                    color: 'var(--color-text)',
                    padding: 0,
                    margin: 0
                }}
                components={{
                    img: ({src, alt}) => (
                        <motion.img
                            src={src}
                            alt={alt}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            transition={{duration: 0.3}}
                            style={{
                                borderRadius: '10px',
                                maxWidth: '100%',
                                height: 'auto',
                                display: 'block',
                                margin: '0.5rem 0'
                            }}
                        />
                    ),
                    code: ({children}) => (
                        <motion.code
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                        >
                            {children}
                        </motion.code>
                    ),
                }}
            />
        </div>)
});

const NoteCardContent = React.memo(({note}) => {
    const navigate = useNavigate();

    return (
        <CardContent sx={contentStyles}>
            <MarkdownContainerStyles onClick={() => navigate(routesPaths.NOTE(note.id))}>
                <Overlay isVisible={true} isAbsolute={true}/>
                <MarkdownComponent content={note.content}/>
            </MarkdownContainerStyles>
        </CardContent>
    )
});

export default NoteCardContent;
