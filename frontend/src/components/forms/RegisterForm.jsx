import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import RoutesPaths from "../../constants/RoutesPaths";
import DynamicForm from "./DynamicForm";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import FirstNameInput from "./FirstNameInput";
import LastNameInput from "./LastNameInput";
import authService from "../../api/authService";
import {
    confirmPasswordValidation,
    emailValidation,
    nameValidation,
    passwordValidation
} from "../../validations/userValidation";


const registerValidationSchema = Yup.object({
    firstname: nameValidation('First name').required("First name is required"),
    lastname: nameValidation('Last name').required("Last name is required"),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
});

const RegisterForm = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (values, actions) => {
        const {email, password, firstname, lastname} = values;

        try {
            await authService.register({email, password, firstname, lastname});
            navigate(RoutesPaths.HOME);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            actions.setSubmitting(false);
        }
    };

    return (
        <DynamicForm
            formHeader="SignUp"
            initialValues={{firstname: "", lastname: "", email: "", password: "", confirmPassword: ""}}
            validationSchema={registerValidationSchema}
            onSubmit={handleSubmit}
            fields={[
                {name: "firstname", component: FirstNameInput, props: {}},
                {name: "lastname", component: LastNameInput, props: {}},
                {name: "email", component: EmailInput, props: {autoFocus: true}},
                {name: "password", component: PasswordInput, props: {}},
                {
                    name: "confirmPassword",
                    component: PasswordInput,
                    props: {placeholder: "Confirm Password", label: "Confirm Password"}
                },
            ]}
            submitButtonText="Create Account"
            replaceWithText="Already have an account?"
            replaceWithHrefText="Login Here"
            replaceWithHref={RoutesPaths.LOGIN}
            errorMessage={errorMessage}
            autoFocusFieldIndex={0}
        />
    );
};

export default RegisterForm;
