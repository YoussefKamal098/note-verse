import React, {memo, useCallback, useEffect, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {BoxStyled, boxVariants, charVariants, containerVariants, OTPContainerStyled} from "./otpStyled";
import {isAlphanumeric} from "shared-utils/string.utils";
import {computeAnimationDelays} from "./otpHelpers";

// List of keys that should be ignored (non-printable/control keys)
const specialKeys = [
    "Shift",
    "Control",
    "Alt",
    "Meta",
    "CapsLock",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Escape",
    "Enter"
];

/**
 * OTPInput Component
 *
 * Renders a series of OTP input boxes and handles key and paste events globally.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {number} props.length - Number of OTP boxes to render.
 * @param {function} props.onChange - Callback fired when the OTP value changes.
 * @param {function} props.onComplete - Callback fired when the OTP input reaches the specified length.
 * @param {function} props.setError - Function to set an error message.
 * @param {boolean} [props.disabled=false] - Flag to disable the input.
 * @param {"idle"|"success"|"error"} [props.animationState="idle"] - Current animation state.
 * @param {number} props.reset - A value that triggers a reset of the OTP input.
 * @returns {JSX.Element} The rendered OTP input component.
 */
const OTPInput = memo(({
                           length,
                           onChange,
                           onComplete,
                           setError,
                           disabled = false,
                           animationState = "idle",
                           reset,
                       }) => {
    const [internalDisabled, setInternalDisabled] = useState(true);
    const [otp, setOtp] = useState("");
    const [deletingIndex, setDeletingIndex] = useState(-1);

    useEffect(() => {
        setTimeout(() => {
            setInternalDisabled(false);
        }, computeAnimationDelays.visible(length));
    }, []);

    useEffect(() => {
        setOtp("");
        setDeletingIndex(-1);
    }, [reset]);

    /**
     * Returns the appropriate animation variant based on the current state.
     */
    const getAnimationVariant = useCallback(() => {
        if (animationState === "error") return "error";
        if (animationState === "success") return "success";
        return "visible";
    }, [animationState]);

    /**
     * Global keydown handler to update OTP input.
     */
    const handleKeyDown = useCallback((e) => {
        if (disabled || internalDisabled) {
            e.preventDefault();
            return;
        }

        if (specialKeys.includes(e.key)) return;

        setError("");

        if (e.key === "Backspace") {
            if (otp.length === 0) return;

            // Set deleting index before updating OTP
            setDeletingIndex(otp.length - 1);
            const newOtp = otp.slice(0, -1);

            setOtp(newOtp);
            onChange?.(newOtp);

            e.preventDefault();
            return;
        }

        if (isAlphanumeric(e.key) && otp.length < length) {
            const newOtp = otp + e.key;

            setOtp(newOtp);
            onChange?.(newOtp);

            if (newOtp.length === length) onComplete?.(newOtp);
        } else if (otp.length < length) {
            setError("Only alphanumeric characters are allowed.");
            e.preventDefault();
        }
    }, [disabled, otp, length, onChange, onComplete, setError, internalDisabled]);

    /**
     * Global paste handler to support pasting the OTP.
     *
     * Iterates through the pasted string until an invalid character is encountered.
     * If an invalid character is found, only the valid portion is accepted and an error is set.
     */
    const handlePaste = useCallback((e) => {
        if (disabled) {
            e.preventDefault();
            return;
        }
        e.preventDefault();
        const pasteData = e.clipboardData.getData("Text");

        let validOtp = "";
        let foundInvalid = false;
        for (let i = 0; i < pasteData.length && validOtp.length < length; i++) {
            const char = pasteData[i];
            if (isAlphanumeric(char)) {
                validOtp += char;
            } else {
                foundInvalid = true;
                break;
            }
        }

        setOtp(validOtp);
        onChange && onChange(validOtp);
        if (validOtp.length === length && onComplete) {
            onComplete(validOtp);
        }
        if (foundInvalid) {
            setError("Only alphanumeric characters are allowed.");
        }
    }, [disabled, length, onChange, onComplete, setError]);

    // Attach global event listeners.
    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("paste", handlePaste);
        };
    }, [handleKeyDown, handlePaste]);

    return (
        <OTPContainerStyled variants={containerVariants} initial="hidden" animate="visible">
            {Array.from({length}).map((_, index) => (
                <BoxStyled
                    key={index}
                    variants={boxVariants}
                    initial={boxVariants.hidden}
                    custom={{index, length}}
                    animate={getAnimationVariant()}
                >
                    <AnimatePresence>
                        {otp[index] && (
                            <motion.span
                                key={`${index}-${otp[index]}`}
                                variants={charVariants}
                                initial={index === deletingIndex ? "exit" : "hidden"}
                                animate="visible"
                                exit="exit"
                                custom={{deleting: index === deletingIndex}}
                            >
                                {otp[index]}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </BoxStyled>
            ))}
        </OTPContainerStyled>
    );
});

export default OTPInput;
