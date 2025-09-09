import React, {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import styled, {keyframes} from 'styled-components';
import {getColorForUser} from "@/utils/colorHashUtil"
import Avatar from "@/components/common/Avatar";
import Tooltip from "@/components/tooltip/Tooltip";
import CloseButton from "@/components/buttons/CloseButton";
import Badge from "@/components/common/Badge";
import {useAuth} from "@/contexts/AuthContext";

const bounceUpDown = keyframes`
    0%, 60%, 100% {
        transform: translateY(0);
        opacity: 0.4;
    }
    30% {
        transform: translateY(-0.25em);
        opacity: 1;
    }
`;

const Wrapper = styled(motion.div)`
    position: fixed;
    top: 10px;
    left: 50%;
    translate: -50% 0;
    background-color: var(--color-background);
    border: 1px solid var(--color-border-secondary);
    border-radius: 10px;
    box-shadow: var(--box-shadow);
    padding: 5px 5px 25px 15px;
    width: 80vw;
    max-width: 300px;
    z-index: 1001;
`;

const Container = styled.div`
    display: flex;
    flex-direction: column;
    //height: 50vh;
    max-height: 150px;
    overflow-y: auto;
    gap: 0.5em;
`;

const Dots = styled.span`
    display: flex;
    gap: 0.25em;
`;

const Dot = styled.span`
    display: inline-block;
    background-color: ${({$color}) => $color};
    border-radius: 50%;
    width: 0.35em;
    height: 0.35em;
    animation: ${bounceUpDown} 1.4s infinite ease-in-out;
    animation-delay: ${({index}) => index * 0.2}s;
`;

const Name = styled.span`
    display: flex;
    align-items: center;
    gap: 0.25em;
    font-weight: 600;
    font-size: 0.8em;
    color: ${({$color}) => $color};
    user-select: none;
`;

const AvatarWrapper = styled.div`
    width: 1.9em;
    height: 1.9em;
    border-radius: 50%;
    border: 0.1em solid var(--color-border);
    margin-right: 0.25em;
    cursor: pointer;
`;

const UserTyping = styled(motion.div)`
    display: flex;
    align-items: center;
    gap: 0.4em;
`;

const CloseWrapper = styled.div`
    display: flex;
    justify-content: flex-end;
    font-size: 0.75em;
    margin-bottom: 0.5em;
`;

const userItemVariants = {
    initial: {opacity: 0, y: -10},
    animate: {opacity: 1, y: 0},
    exit: {opacity: 0, y: 10},
};

const wrapperVariants = {
    hidden: {opacity: 0, scale: 0.95, y: -20},
    visible: {opacity: 1, scale: 1, y: 0},
    exit: {opacity: 0, scale: 0.95, y: -20},
};

const TypingIndicatorsPopUp = ({users, noteOwnerId}) => {
    const {user: authUser} = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const previousIds = useRef([]);

    // Detect changes in users
    useEffect(() => {
        const currentIds = users.map(u => u.id);
        const prevIds = previousIds.current;

        const hasChange = currentIds.length !== prevIds.length ||
            currentIds.some((id, i) => id !== prevIds[i]);

        if (hasChange && currentIds.length > 0) {
            setIsOpen(true);
        }

        previousIds.current = currentIds;
    }, [users]);

    return (
        <AnimatePresence>
            {isOpen && users.length > 0 && (
                <Wrapper
                    variants={wrapperVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{duration: 0.3, ease: "easeOut"}}
                >
                    <CloseWrapper>
                        <CloseButton onClick={() => setIsOpen(false)} ariaLabel="Hide typing users"/>
                    </CloseWrapper>

                    <Container>
                        <AnimatePresence>
                            {users.map(user => (
                                <UserTyping
                                    key={user.id}
                                    variants={userItemVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    layout
                                >
                                    <AvatarWrapper>
                                        <Tooltip title={`${user.firstname} ${user.lastname}`} containerStyle={{
                                            width: "100%",
                                            height: "100%"
                                        }}>
                                            <Avatar avatarUrl={user.avatarUrl}/>
                                        </Tooltip>
                                    </AvatarWrapper>
                                    <Name
                                        $color={getColorForUser(user.id, user.firstname, user.lastname)}
                                    >
                                        {user.firstname}
                                        {user?.id === authUser.id && <Badge label={"you"}/>}
                                        {user?.id === noteOwnerId && <Badge label={"owner"}/>}
                                        {' '}
                                        is editing
                                    </Name>

                                    <Dots>
                                        {[0, 1, 2].map(i => (
                                            <Dot key={i} index={i}
                                                 $color={getColorForUser(user.id, user.firstname, user.lastname)}
                                            />
                                        ))}
                                    </Dots>
                                </UserTyping>
                            ))}
                        </AnimatePresence>
                    </Container>
                </Wrapper>
            )}
        </AnimatePresence>
    );
};

const areEqual = (prevProps, nextProps) => {
    const prevIds = prevProps.users.map(u => u.id).join(',');
    const nextIds = nextProps.users.map(u => u.id).join(',');
    return prevIds === nextIds;
};

export default React.memo(TypingIndicatorsPopUp, areEqual);
