import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import * as Yup from "yup";
import RoutesPaths from "../../constants/RoutesPaths";
import {FieldTypes, requiredField} from "../../validations/fieldTypeValidators";
import {emailValidation} from "../../validations/userValidation";
import DynamicForm from "./DynamicForm";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import AuthService from '../../api/authService';


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
            navigate(RoutesPaths.HOME);
        } catch (error) {
            setErrorMessage(error.message);
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
            submitButtonText="Log in"
            replaceWithText="Don't have an account?"
            replaceWithHrefText="Register Here"
            replaceWithHref={RoutesPaths.REGISTER}
            errorMessage={errorMessage}
            autoFocusFieldIndex={0}
        />
    );
};

export default LoginForm;
