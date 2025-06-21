import React, {useEffect} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import routesPaths from "../constants/routesPaths";
import OTPVerification from "../components/otp/OTPVerification";

/**
 * OTPVerificationPage Component
 *
 * Extracts the email from the location state and renders the OTPVerification component.
 * If no email is provided, it falls back to a default email.
 *
 * @returns {JSX.Element} The OTP verification page.
 */
const OTPVerificationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    let email = location.state?.email;

    useEffect(() => {
        if (!email) {
            // Redirect to the registration page if email is missing
            navigate(routesPaths.REGISTER, {replace: true});
        }
    }, [email, navigate]);

    // Render nothing while redirecting
    if (!email) return null;

    return (
        <div className="page">
            <Navbar/>
            <div className="wrapper">
                <OTPVerification email={email}/>
            </div>
        </div>
    );
};

export default OTPVerificationPage;
