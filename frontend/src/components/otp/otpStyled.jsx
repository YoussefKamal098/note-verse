import styled from "styled-components";
import {motion} from "framer-motion";
import {deepFreeze} from "shared-utils/obj.utils";
import {animations} from "./otpHelpers";

/** Animation variants for the container */
const containerVariants = {
    hidden: {opacity: 0, y: -20},
    visible: {
        opacity: 1,
        y: 0,
        transition: {when: "beforeChildren", staggerChildren: 0.1},
    },
};

/** Animation variants for OTP boxes */
const boxVariants = {
    hidden: {opacity: 0, y: -45},
    visible: ({index}) => ({
        opacity: 1,
        y: 0,
        transition: {
            opacity: {
                duration: animations.visible.opacity.duration,
                delay: index * animations.visible.delayPerBox,
            },
            y: {
                duration: animations.visible.y.duration,
                delay: index * animations.visible.delayPerBox,
            },
        },
    }),
    error: ({index, length}) => ({
        opacity: 1,
        y: 0,
        scale: [1, 1.1, 1],
        x: [0, -10, 10, -10, 0],
        borderColor: "var(--color-danger)",
        transition: {
            borderColor: {
                duration: animations.error.borderColor.duration,
                delay: index * animations.error.borderColor.delayPerBox,
            },
            scale: {
                duration: animations.error.scale.duration,
                delay: index * animations.error.scale.delayPerBox,
            },
            x: {
                duration: animations.error.x.duration,
                delay: length * animations.error.x.delayPerBox + animations.error.x.delayBase,
            },
        },
    }),
    success: ({index}) => ({
        opacity: 1,
        y: 0,
        scale: [1, 1.1, 1],
        borderColor: "var(--color-accent)",
        transition: {duration: 0.5, delay: index * 0.1},
    }),
};

const charVariants = {
    hidden: {y: 20, opacity: 0},
    visible: {
        y: 0,
        opacity: 1,
        transition: {type: "spring", stiffness: 300, damping: 20},
    },
    exit: {
        y: 20,
        opacity: 0,
        transition: {duration: 0.1},
    },
};

/** Animation variants for the email verified icon */
const emailVerifiedVariants = {
    hidden: {y: -10, opacity: 0},
    visible: {y: 0, opacity: 1, transition: {duration: 0.5, ease: "easeOut"}},
};

/** Styled components */
const VerificationContainerStyled = styled(motion.div)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 525px;
    margin: 2em auto;
    gap: 2em;
`;

const ContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
`;

const TextStyled = styled.div`
    font-size: 1em;
    text-align: center;
    color: var(--color-text);
`;

const OTPContainerStyled = styled(motion.div)`
    display: flex;
    justify-content: center;
    gap: 0.5em;
`;

const BoxStyled = styled(motion.div)`
    width: 1.8em;
    height: 1.8em;
    font-size: 1.5em;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: calc(var(--border-radius) / 2);
    border: calc(var(--border-width) / 1.25) solid var(--color-border);
    background: transparent;
    transition: border-color 0.2s ease;
    overflow: hidden;

    span {
        display: block;
        will-change: transform;
    }
`;

const ErrorMessageStyled = styled(motion.div)`
    color: var(--color-danger);
    text-align: center;
    margin-top: 0.5em;
    font-size: 0.9em;
    font-weight: 600;
`;

const EmailVerifiedStyled = styled(motion.div)`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    font-size: 0.9em;
    font-weight: 600;
    color: var(--color-placeholder);
    gap: 0.5em;

    .icon {
        font-size: 1.5em;
        color: var(--color-accent);
    }
`;

/**
 * Frozen container animation variants.
 * @constant {Readonly<Object>}
 */
const frozenContainerVariants = deepFreeze(containerVariants);

/**
 * Frozen OTP box animation variants.
 * @constant {Readonly<Object>}
 */
const frozenBoxVariants = deepFreeze(boxVariants);

/**
 * Frozen character animation variants.
 * @constant {Readonly<Object>}
 */
const frozenCharVariants = deepFreeze(charVariants);

/**
 * Frozen email verified icon animation variants.
 * @constant {Readonly<Object>}
 */
const frozenEmailVerifiedVariants = deepFreeze(emailVerifiedVariants);

export {
    frozenContainerVariants as containerVariants,
    frozenBoxVariants as boxVariants,
    frozenCharVariants as charVariants,
    frozenEmailVerifiedVariants as emailVerifiedVariants,
    VerificationContainerStyled,
    ContainerStyled,
    TextStyled,
    OTPContainerStyled,
    BoxStyled,
    ErrorMessageStyled,
    EmailVerifiedStyled,
};
