import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { emailValidation, passwordValidation } from "../../validations/userValidation";
import AuthService from '../../api/authService';
import DynamicForm from "./DynamicForm";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

const loginValidationSchema = Yup.object({
    email: emailValidation,
    password: passwordValidation,
});

const LoginForm = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (values, actions) => {
        const { email, password } = values;

        try {
            const result = await AuthService.login({ email, password });
            if (result.statusCode !== 200) {
                setErrorMessage(result.message || "An error occurred. Please try again.");
                return;
            }

            navigate("/home");
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <DynamicForm
            formHeader="Login"
            initialValues={{ email: "", password: "" }}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
            fields={[
                { name: "email", component: EmailInput, props: { autoFocus: true } },
                { name: "password", component: PasswordInput, props: {} },
            ]}
            submitButtonText="Login"
            linkText="Don't have an account?"
            linkHref="/register"
            errorMessage={errorMessage}
            autoFocusFieldIndex={0}
        />
    );
};

export default LoginForm;
