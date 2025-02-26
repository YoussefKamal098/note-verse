import styled from "styled-components";
import {motion} from "framer-motion";
import {
    borderColorDelayPerBox,
    borderColorDuration,
    scaleDelayPerBox,
    scaleDuration,
    xDelayBase,
    xDelayPerBox,
    xDuration,
} from "./otpUtils";

/** Animation variants for the container */
export const containerVariants = Object.freeze({
    hidden: {opacity: 0, y: -20},
    visible: {
        opacity: 1,
        y: 0,
        transition: {when: "beforeChildren", staggerChildren: 0.1},
    },
});

/** Animation variants for OTP boxes */
export const boxVariants = Object.freeze({
    hidden: {opacity: 0, y: -25, borderColor: "var(--color-border)"},
    visible: {opacity: 1, y: 0, borderColor: "var(--color-border)"},
    error: ({index, length}) => ({
        scale: [1, 1.1, 1],
        x: [0, -10, 10, -10, 0],
        borderColor: "var(--color-danger)",
        transition: {
            borderColor: {duration: borderColorDuration, delay: index * borderColorDelayPerBox},
            scale: {duration: scaleDuration, delay: index * scaleDelayPerBox},
            x: {duration: xDuration, delay: length * xDelayPerBox + xDelayBase},
        },
    }),
    success: ({index}) => ({
        scale: [1, 1.1, 1],
        borderColor: "var(--color-accent)",
        transition: {duration: 0.5, delay: index * 0.1},
    }),
});

/** Animation variants for the email verified icon */
export const emailVerifiedVariants = Object.freeze({
    hidden: {y: -10, opacity: 0},
    visible: {y: 0, opacity: 1, transition: {duration: 0.5, ease: "easeOut"}},
});

/** Styled components */
export const VerificationContainerStyled = styled(motion.div)`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    max-width: 525px;
    margin: 2em auto;
    gap: 2em;
`;

export const ContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5em;
`;

export const TextStyled = styled.div`
    font-size: 1em;
    text-align: center;
    color: var(--color-text);
`;

export const OTPContainerStyled = styled(motion.div)`
    display: flex;
    justify-content: center;
    gap: 0.5em;
`;

export const BoxStyled = styled(motion.div)`
    width: 45px;
    height: 45px;
    font-size: 1.5em;
    font-weight: 600;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: calc(var(--border-radius) / 2);
    border: calc(var(--border-width) / 1.25) solid var(--color-border);
    background: transparent;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
`;

export const ErrorMessageStyled = styled(motion.div)`
    color: var(--color-danger);
    text-align: center;
    margin-top: 0.5em;
    font-size: 0.9em;
`;

export const EmailVerifiedStyled = styled(motion.div)`
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
