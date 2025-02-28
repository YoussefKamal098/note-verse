import React, {memo, useCallback, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {motion} from "framer-motion";
import {LuCircleCheckBig} from "react-icons/lu";
import {isAlphanumeric} from "shared-utils/string.utils";
import {maskEmail} from "shared-utils/email.utils";
import {computeAnimationDelays} from "./otpHelpers";
import OTPInput from "./OTPInput";
import Button, {BUTTON_TYPE} from "../buttons/Button";
import {HeightTransitionContainer} from "../animations/ContainerAnimation";
import LoadingEffect from "../common/LoadingEffect";
import authService from "../../api/authService";
import RoutesPaths from "../../constants/RoutesPaths";

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
 * Manages OTP input state and simulates verification.
 * On error, use a timeout based on clearDelay to reset the OTP input.
 * On success, a success animation is shown and the user is redirected after 3 seconds.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {string} props.email - The email address to be verified.
 * @param {number} [props.length=6] - Number of OTP characters expected.
 * @returns {JSX.Element} The rendered OTP verification component.
 */
const OTPVerification = memo(({email, length = 6}) => {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [animationState, setAnimationState] = useState("idle"); // "idle" | "error" | "success"
    const [resetOtp, setResetOtp] = useState(0);
    const navigate = useNavigate();

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

        // Validate an OTP format using the util function.
        if (!isAlphanumeric(code)) {
            setError("Invalid OTP. Only alphanumeric characters are allowed.");
            setAnimationState("error");
            setIsVerifying(false);
            setTimeout(() => {
                setAnimationState("idle");
                setOtp("");
                setResetOtp((prev) => prev + 1);
            }, clearDelay);
            return;
        }

        try {
            try {
                await authService.verifyEmail({email, otpCode: code});
                setAnimationState("success");
                // Redirect to the home page after 3 seconds.
                setTimeout(() => {
                    navigate(RoutesPaths.HOME);
                }, 3000);
            } catch (err) {
                setError(`OTP verification failed. ${err.message}`);
                setAnimationState("error");
                setTimeout(() => {
                    setAnimationState("idle");
                    setOtp("");
                    setResetOtp((prev) => prev + 1);
                }, clearDelay);
            }
        } catch (err) {
            setError("An error occurred during verification. Please try again later.");
            setAnimationState("error");
            setTimeout(() => {
                setAnimationState("idle");
                setOtp("");
                setResetOtp((prev) => prev + 1);
            }, clearDelay);
        }
        setIsVerifying(false);
    }, [email, clearDelay]);

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
                <h2>OTP Verification</h2>
                <TextStyled>
                    Please enter the {length}-character alphanumeric code sent to{" "}
                    <strong>{maskEmail(email)}</strong> to verify your account.
                    <br/>
                    You may paste the complete code at once. Only alphanumeric characters are allowed.
                </TextStyled>
            </ContainerStyled>

            <ContainerStyled>
                <OTPInput
                    length={length}
                    onChange={handleOTPChange}
                    onComplete={handleOTPChange}
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
                            <LuCircleCheckBig className="icon"/> Email verified successfully!
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
                            "Verify Email"
                        )}
                    </Button>
                )}
            </ContainerStyled>
        </VerificationContainerStyled>
    );
});

export default OTPVerification;
