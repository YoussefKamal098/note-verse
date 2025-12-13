export const MOTION_VARIANTS = {
    reactionHover: {
        like: {
            y: -12,
            scale: 1.35,
            rotate: -8,
            transition: {type: "spring", stiffness: 400, damping: 10, mass: 0.5},
        },
        love: {
            y: -14,
            scale: 1.4,
            rotate: 12,
            transition: {type: "spring", stiffness: 380, damping: 8, mass: 0.5},
        },
    },

    mainButton: {
        like: {
            scale: [1, 1.35, 1.25, 1.3, 1],
            rotate: [0, -10, 6, -4, 0],
            transition: {duration: 0.4, times: [0, 0.2, 0.4, 0.7, 1], ease: "easeOut"},
        },
        love: {
            scale: [1, 1.4, 1.3, 1.35, 1],
            rotate: [0, 15, -8, 5, 0],
            transition: {duration: 0.45, times: [0, 0.2, 0.45, 0.7, 1], ease: "easeOut"},
        },
        remove: {
            scale: [1, 0.9, 1],
            transition: {duration: 0.2, ease: "easeOut"},
        },
    },

    bubble: {
        initial: {opacity: 0, y: 20, scale: 0.9},
        animate: {opacity: 1, y: 0, scale: 1},
        exit: {opacity: 0, y: 15, scale: 0.95},
        transition: {type: "spring", stiffness: 260, damping: 20},
    },

    iconsRow: {
        hidden: {},
        visible: {transition: {staggerChildren: 0.07, delayChildren: 0.05}},
    },

    iconWrap: {
        hidden: {opacity: 0, y: 15, scale: 0.7},
        visible: {opacity: 1, y: 0, scale: 1},
    },
};
