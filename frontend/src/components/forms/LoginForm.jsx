import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import {FieldTypes, requiredField} from "../../validations/fieldTypeValidators";
import {emailValidation} from "../../validations/userValidation";
import AuthService from '../../api/authService';
import DynamicForm from "./DynamicForm";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";

const loginValidationSchema = Yup.object({
    email: emailValidation,
    password: requiredField("password", FieldTypes.STRING)
});

const LoginForm = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (values, actions) => {
        const {email, password} = values;

        try {
            await AuthService.login({email, password});
            navigate("/home");
        } catch (error) {
            setErrorMessage(error.message || "An error occurred. Please try again.");
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <DynamicForm
            formHeader="Login"
            initialValues={{email: "", password: ""}}
            validationSchema={loginValidationSchema}
            onSubmit={handleSubmit}
            fields={[
                {name: "email", component: EmailInput, props: {autoFocus: true}},
                {name: "password", component: PasswordInput, props: {}},
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
