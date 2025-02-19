import React, {useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {HeightTransitionContainer} from "../animations/ContainerAnimation";
import {FadeInAnimatedText} from "../animations/TextAnimation";
import useFormNavigation from "../../hooks/useFormNavigation";
import {ErrorMessageStyled, FormContainerStyled, FormHeaderStyled, LinkStyled} from "./formStyles";
import SubmitButton from "./SubmitButtom";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import AuthService from "../../api/authService";
import RoutesPaths from "../../constants/RoutesPaths";
import {FieldTypes, requiredField} from "../../validations/fieldTypeValidators";
import {emailValidation} from "../../validations/userValidation";

const loginValidationSchema = Yup.object({
    email: emailValidation,
    password: requiredField("password", FieldTypes.STRING),
});

const LoginForm = () => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const fieldRefs = [emailRef, passwordRef];
    const {handleKeyDown} = useFormNavigation(fieldRefs);

    const handleSubmit = async (values, {setSubmitting}) => {
        try {
            setLoading(true);
            await AuthService.login(values);
            navigate(RoutesPaths.HOME);
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
            setLoading(false);
        }
    };

    return (
        <HeightTransitionContainer keyProp="Login">
            <FormContainerStyled>
                <FormHeaderStyled>Login</FormHeaderStyled>

                <HeightTransitionContainer keyProp={errorMessage}>
                    {errorMessage && (
                        <ErrorMessageStyled>
                            <FadeInAnimatedText text={errorMessage}/>
                        </ErrorMessageStyled>
                    )}
                </HeightTransitionContainer>

                <Formik
                    initialValues={{email: "", password: ""}}
                    validationSchema={loginValidationSchema}
                    onSubmit={handleSubmit}
                >
                    {({isSubmitting}) => (
                        <Form onKeyDown={(e) => handleKeyDown(e, isSubmitting)}>
                            <Field
                                name="email"
                                component={EmailInput}
                                innerRef={emailRef}
                                autoFocus
                            />
                            <Field
                                name="password"
                                component={PasswordInput}
                                innerRef={passwordRef}
                            />
                            <SubmitButton isSubmitting={isSubmitting} loading={loading}>Login</SubmitButton>
                        </Form>
                    )}
                </Formik>

                <LinkStyled>
                    <p>Don't have an account?</p>
                    <a href={RoutesPaths.REGISTER}>Register Here</a>
                </LinkStyled>
            </FormContainerStyled>
        </HeightTransitionContainer>
    );
};

export default LoginForm;
