import React from 'react';
import Navbar from "../components/navbar/Navbar";
import LoginForm from "../components/forms/LoginForm";

const LoginPage = () => {
    return (
        <div className="page">
            <Navbar/>

            <div className="wrapper">
                <LoginForm/>
            </div>
        </div>
    );
}

export default LoginPage;
