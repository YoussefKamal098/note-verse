import React, {useCallback, useMemo, useState} from "react";
import {motion} from "framer-motion";
import {LuCircleCheckBig} from "react-icons/lu";
import {isAlphanumeric} from "shared-utils/string.utils";
import {computeAnimationDelays} from "./otpHelpers";
import OTPInput from "./OTPInput";
import Button, {BUTTON_TYPE} from "../buttons/Button";
import {HeightTransitionContainer} from "../animations/ContainerAnimation";
import LoadingEffect from "../common/LoadingEffect";

import {
    ContainerStyled,
    containerVariants,
    EmailVerifiedStyled,
    emailVerifiedVariants,
    ErrorMessageStyled,
    TextStyled,
    VerificationContainerStyled,
} from "./otpStyled";


/**
 * OTPVerification Component
 *
 * A reusable and animated OTP (One-Time Password) verification UI. Handles OTP input state,
 * validation, error/success animations, and optional callback hooks for external verification and success behavior.
 *
 * Supports any verification type (e.g., email, password reset, phone) via configurable props.
 *
 * @component
 * @example
 * <OTPVerification
 *   maskedTarget="y***f@gmail.com"
 *   verificationType="Email"
 *   onVerify={verifyEmailFn}
 *   onSuccess={() => navigate('/home')}
 * />
 *
 * @param {Object} props - Component props.
 * @param {string} props.maskedTarget - The masked target (e.g., masked email or phone) displayed to the user.
 * @param {number} [props.length=6] - The expected OTP length.
 * @param {string} [props.verificationType="OTP"] - The type of verification (used in UI copy).
 * @param {function(string): Promise<void>} props.onVerify - Async function that performs OTP verification. Receives the OTP code.
 * @param {function} [props.onSuccess] - Optional callback triggered after a successful verification (e.g., redirect).
 * @param {string} [props.successMessage] - Custom message shown after successful verification.
 *
 * @returns {React.JSX.Element} Rendered OTP verification interface.
 */
const OTPVerification = ({
                             maskedTarget,
                             length = 6,
                             verificationType = "OTP",
                             onVerify,
                             onSuccess,
                             successMessage = `${verificationType} verified successfully!`
                         }) => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [animationState, setAnimationState] = useState("idle"); // "idle" | "error" | "success"
    const [resetOtp, setResetOtp] = useState(0);

    // Disable input when verifying or when not idle.
    const disabledInput = isVerifying || animationState !== "idle";
    const clearDelay = useMemo(() => computeAnimationDelays.error(length), [length]);

    /**
     * Verifies the OTP using a simulated API call.
     *
     * If the OTP is invalid or verification fails, sets the error state and resets the input after clearDelay.
     * On success, shows a success animation and redirects after 3 seconds.
     *
     * @param {string} code - The OTP code to verify.
     */
    const verifyOTP = useCallback(async (code) => {
        setIsVerifying(true);
        setError("");

        if (!isAlphanumeric(code)) {
            setError("Invalid OTP. Only alphanumeric characters are allowed.");
            handleError();
            return;
        }

        try {
            await onVerify(code);
            setAnimationState("success");
            setTimeout(() => onSuccess?.(), 3000);
        } catch (err) {
            setError("An error occurred during verification. Please try again later.");
            handleError();
        }

        function handleError() {
            setAnimationState("error");
            setTimeout(() => {
                setAnimationState("idle");
                setOtp("");
                setResetOtp((prev) => prev + 1);
            }, clearDelay);
        }

        setIsVerifying(false);
    }, [onVerify, onSuccess, clearDelay]);

    /**
     * Handler for OTP changes. Initiates verification when the input is complete.
     *
     * @param {string} value - The current OTP input.
     */
    const handleOTPChange = useCallback((value) => {
        setOtp(value);
        setError("");
        if (value.length === length) {
            verifyOTP(value);
        }
    }, [length, verifyOTP]);

    return (
        <VerificationContainerStyled
            variants={containerVariants} initial="hidden" animate="visible"
        >
            <ContainerStyled>
                <h2>{verificationType} Verification</h2>
                <TextStyled>
                    Please enter the {length}-character alphanumeric code sent to{" "}
                    <strong>{maskedTarget}</strong> to verify your account.
                    <br/>
                    You may paste the complete code at once. Only alphanumeric characters are allowed.
                </TextStyled>
            </ContainerStyled>

            <ContainerStyled>
                <OTPInput
                    length={length}
                    onChange={handleOTPChange}
                    setError={setError}
                    disabled={disabledInput}
                    animationState={animationState}
                    reset={resetOtp}
                />
                <HeightTransitionContainer>
                    {error && <ErrorMessageStyled>{error}</ErrorMessageStyled>}
                </HeightTransitionContainer>
            </ContainerStyled>

            <ContainerStyled>
                {animationState === "success" ? (
                    <motion.div variants={emailVerifiedVariants} initial="hidden" animate="visible">
                        <EmailVerifiedStyled>
                            <LuCircleCheckBig className="icon"/> {successMessage}
                        </EmailVerifiedStyled>
                    </motion.div>
                ) : (
                    <Button
                        type={BUTTON_TYPE.SUCCESS}
                        onClick={() => verifyOTP(otp)}
                        disabled={isVerifying || otp.length !== length || animationState !== "idle"}
                    >
                        {isVerifying ? (
                            <LoadingEffect color="var(--color-background)" loading={isVerifying} size={19}/>
                        ) : (
                            `Verify ${verificationType}`
                        )}
                    </Button>
                )}
            </ContainerStyled>
        </VerificationContainerStyled>
    );
};

export default React.memo(OTPVerification);
