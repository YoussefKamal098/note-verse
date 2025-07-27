import React, {forwardRef} from "react";
import {AnimatePresence} from 'framer-motion';
import {HiOutlineBell} from 'react-icons/hi2';
import {IconButton} from '@mui/material';
import {BellButtonStyles, Badge} from './styles';

const BellButton = forwardRef(({
                                   onClick,
                                   unreadCount
                               }, ref) => {
    return (
        <IconButton aria-label="notification-bell" sx={{color: 'var(--color-text)', fontSize: "1em", padding: "0"}}>
            <BellButtonStyles
                ref={ref}
                onClick={onClick}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
            >
                <HiOutlineBell/>
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <Badge
                            key={`unreadCount${unreadCount}`}
                            initial={{scale: 0, rotate: -45}}
                            animate={{
                                scale: 1,
                                rotate: 0,
                                transition: {
                                    type: 'spring',
                                    stiffness: 500,
                                    damping: 15
                                }
                            }}
                            exit={{scale: 0}}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </AnimatePresence>
            </BellButtonStyles>
        </IconButton>
    );
});

export default React.memo(BellButton);
