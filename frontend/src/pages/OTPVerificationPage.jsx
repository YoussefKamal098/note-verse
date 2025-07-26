import React, {useEffect, useMemo} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {maskEmail} from "shared-utils/email.utils";
import Navbar from "../components/navbar/Navbar";
import routesPaths from "../constants/routesPaths";
import OTPVerification from "../components/otp/OTPVerification";
import authService from "../api/authService";

/**
 * OTPVerificationPage Component
 *
 * Extracts the email from the location state and renders the OTPVerification component.
 * If no email is provided, it redirects to the registration page.
 *
 * @returns {JSX.Element} The OTP verification page.
 */
const OTPVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const from = location.state?.from?.pathname || routesPaths.HOME;

    useEffect(() => {
        !email && navigate(routesPaths.REGISTER, {replace: true});
    }, [email, navigate]);

    const handleVerify = async (otpCode) => {
        await authService.verifyEmail({email, otpCode});
    };

    const handleSuccess = () => {
        navigate(from, {replace: true});
    };

    const maskedEmail = useMemo(() => maskEmail(email), [email]);

    if (!email) return null;

    return (
        <div className="page">
            <Navbar/>
            <div className="wrapper">
                <OTPVerification
                    maskedTarget={maskedEmail}
                    verificationType="Email"
                    onVerify={handleVerify}
                    onSuccess={handleSuccess}
                />
            </div>
        </div>
    );
};

export default OTPVerificationPage;
