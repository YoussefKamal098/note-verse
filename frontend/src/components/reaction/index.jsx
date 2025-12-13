import React, {useState, useRef, useEffect, useCallback} from "react";
import {motion, AnimatePresence} from "framer-motion";
import {Reactions} from "@/constants/reactionTypes"
import Tooltip from "@/components/tooltip/Tooltip";
import useClickCooldown from "@/hooks/useClickCooldown";
import useElementPosition from "@/hooks/useElementPosition";
import useHoverTimeout from "@/hooks/useHoverTimeout";
import REACTIONS from "./constants";
import {MOTION_VARIANTS} from "./motion";
import {Wrapper, MainButton, Bubble, IconsRow, IconWrap} from "./styles";

function ReactionButton({targetId = null, value = null, onChange, size = 35}) {
    const [open, setOpen] = useState(false);
    const [current, setCurrent] = useState(value ?? null);
    const [isAnimating, setIsAnimating] = useState(false);
    const wrapperRef = useRef(null);
    const mainBtnRef = useRef(null);
    const canClick = useClickCooldown();
    const bubblePos = useElementPosition(mainBtnRef, open);
    const {handleMouseEnter, handleMouseLeave} = useHoverTimeout(500, () => setOpen(false));

    useEffect(() => setCurrent(value ?? null), [value]);

    useEffect(() => {
        const handler = (e) => wrapperRef.current?.contains(e.target) || setOpen(false);
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleReaction = useCallback((reaction) => {
        if (!canClick()) return;
        const next = reaction;
        setCurrent(next);
        onChange?.(next, targetId);
        setIsAnimating(true);
        setOpen(false);
        setTimeout(() => setIsAnimating(false), 500);
    }, [onChange, targetId, canClick]);

    const toggleLike = () => {
        setOpen(false);

        if (!canClick()) return;
        const next = current ? null : Reactions.LIKE;
        setCurrent(next);
        setIsAnimating(true);
        onChange?.(next, targetId);
        setTimeout(() => setIsAnimating(false), 400);
    };

    const getMainButtonAnimation = () => {
        if (!isAnimating) return {};
        if (current === Reactions.LIKE) return MOTION_VARIANTS.mainButton.like;
        if (current === Reactions.LOVE) return MOTION_VARIANTS.mainButton.love;
        return MOTION_VARIANTS.mainButton.remove;
    };

    const onMouseEnter = () => {
        setOpen(true);
        handleMouseEnter();
    }

    const MainIcon = current ? REACTIONS[current]?.Icon : REACTIONS[Reactions.LIKE].Icon;
    const iconColor = REACTIONS[current]?.colorVar;

    return (
        <Wrapper ref={wrapperRef}>
            <Tooltip title={current ? `UN${current.toUpperCase()}` : Reactions.LIKE.toUpperCase()}>
                <MainButton
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    ref={mainBtnRef}
                    as={motion.button}
                    $size={size}
                    onClick={toggleLike}
                    whileTap={{scale: 0.85}}
                    whileHover={{scale: 1.07, transition: {duration: 0.15}}}
                    animate={getMainButtonAnimation()}
                    aria-pressed={!!current}
                >
                    <MainIcon size={Math.max(18, size * 0.55)} color={iconColor || "var(--color-placeholder)"}/>
                </MainButton>
            </Tooltip>

            <AnimatePresence>
                {open && (
                    <Bubble
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        {...MOTION_VARIANTS.bubble}
                        style={{
                            position: 'fixed',
                            top: `${bubblePos.top - bubblePos.height - 10}px`,
                            left: `${bubblePos.left}px`,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <IconsRow initial="hidden" animate="visible" variants={MOTION_VARIANTS.iconsRow}>
                            {Object.entries(REACTIONS).map(([type, {Icon, colorVar}]) => (
                                <IconWrap
                                    key={type}
                                    variants={MOTION_VARIANTS.iconWrap}
                                    whileHover={MOTION_VARIANTS.reactionHover[type]}
                                    whileTap={{scale: 0.8}}
                                    onClick={() => handleReaction(type)}
                                >
                                    <Tooltip title={type.toUpperCase()}>
                                        <Icon size={30} color={colorVar}/>
                                    </Tooltip>
                                </IconWrap>
                            ))}
                        </IconsRow>
                    </Bubble>
                )}
            </AnimatePresence>
        </Wrapper>
    );
}

export default React.memo(ReactionButton);
