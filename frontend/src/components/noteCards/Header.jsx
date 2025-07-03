import React from 'react';
import {CardHeader, Typography} from '@mui/material';
import {Description} from '@mui/icons-material';
import {formatDate} from 'shared-utils/date.utils';
import PinStatus from './PinStatus';
import Spinner from '../buttons/LoadingSpinnerButton';
import NoteMenu from "../menus/noteMenu";

const NoteCardHeader = React.memo(({note, onTogglePin, onDelete, loading}) => {
    const headerStyles = {
        p: '12px 16px',
        backgroundColor: 'var(--color-background-secondary)',
        borderBottom: '2px solid var(--color-border)',
        '& .MuiCardHeader-content': {overflow: 'hidden', minWidth: 0},
        '& .MuiTypography-body1': {
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            width: '100%',
            fontSize: '16px',
            lineHeight: 1.5,
        },
        '& .MuiCardHeader-subheader': {
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        '& .MuiCardHeader-avatar': {marginRight: '12px', minWidth: '40px'},
        '& .MuiCardHeader-action': {margin: 0, alignSelf: 'center'}
    };

    return (
        <CardHeader
            avatar={<Description color="primary" fontSize="large"/>}
            action={
                <Spinner loading={loading} color="var(--color-text)">
                    <NoteMenu
                        onDelete={onDelete}
                        onTogglePin={onTogglePin}
                        isPinned={note.isPinned}
                    />
                </Spinner>
            }
            sx={headerStyles}
            title={
                <Typography
                    fontWeight={600}
                    color="var(--color-text)"
                    fontFamily='"Quicksand", sans-serif'
                >
                    {note.title || "Title"}
                </Typography>
            }
            subheader={
                <>
                    <Typography
                        variant="caption"
                        color="var(--color-placeholder)"
                        fontFamily='"Quicksand", sans-serif'
                        fontWeight={600}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            minWidth: 0,
                            flexShrink: 1
                        }}
                    >
                        {formatDate(note.createdAt) || 'Created recently'}
                    </Typography>
                    <PinStatus isPinned={note.isPinned}/>
                </>
            }
        />
    );
});

export default NoteCardHeader;
