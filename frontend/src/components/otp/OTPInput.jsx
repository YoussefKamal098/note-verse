import React, {memo, useCallback, useEffect, useState} from "react";
import {BoxStyled, boxVariants, containerVariants, OTPContainerStyled} from "./otpStyled";
import {isAlphanumeric} from "shared-utils/string.utils";

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
    const [otp, setOtp] = useState("");

    // Reset OTP when the 'reset' prop changes.
    useEffect(() => {
        setOtp("");
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
        if (disabled) {
            e.preventDefault();
            return;
        }
        setError("");

        // Handle backspace when no characters are present.
        if (e.key === "Backspace" && otp.length === 0) {
            e.preventDefault();
            return;
        }

        // Handle backspace to remove the last character.
        if (e.key === "Backspace" && otp.length > 0) {
            const newOtp = otp.slice(0, -1);
            setOtp(newOtp);
            onChange && onChange(newOtp);
            e.preventDefault();
            return;
        }

        // Accept valid alphanumeric input.
        if (isAlphanumeric(e.key) && otp.length < length) {
            const newOtp = otp + e.key;
            setOtp(newOtp);
            onChange && onChange(newOtp);
            if (newOtp.length === length && onComplete) {
                onComplete(newOtp);
            }
        } else if (otp.length < length) {
            setError("Only alphanumeric characters are allowed.");
            e.preventDefault();
        }
    }, [disabled, otp, length, onChange, onComplete, setError]);

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
        window.addEventListener("keyup", handleKeyDown);
        window.addEventListener("paste", handlePaste);
        return () => {
            window.removeEventListener("keyup", handleKeyDown);
            window.removeEventListener("paste", handlePaste);
        };
    }, [handleKeyDown, handlePaste]);

    return (
        <OTPContainerStyled variants={containerVariants} initial="hidden" animate="visible">
            {Array.from({length}).map((_, index) => (
                <BoxStyled
                    key={index}
                    variants={boxVariants}
                    custom={{index, length}}
                    animate={getAnimationVariant()}
                >
                    {otp[index] || ""}
                </BoxStyled>
            ))}
        </OTPContainerStyled>
    );
});

export default OTPInput;
