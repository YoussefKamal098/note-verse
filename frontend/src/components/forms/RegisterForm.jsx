import React, {useRef, useState} from "react";
import styled from "styled-components";
import {useNavigate} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {HeightTransitionContainer} from "@/components/animations/ContainerAnimation";
import {FadeInAnimatedText} from "@/components/animations/TextAnimation";
import Overlay from "@/components/common/Overlay";
import useFormNavigation from "@/hooks/useFormNavigation";
import SubmitButton from "./SubmitButtom";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import FirstNameInput from "./FirstNameInput";
import LastNameInput from "./LastNameInput";
import AuthSeparator from "./AuthSeparator";
import GoogleLoginButton from "./GoogleLoginButton";
import authService from "@/api/authService";
import routesPaths from "@/constants/routesPaths";
import {
    confirmPasswordValidation,
    emailValidation,
    nameValidation,
    passwordValidation
} from "@/validations/userValidation";
import {ErrorMessageStyled, FormContainerStyled, FormHeaderStyled, LinkStyled} from "./Styles";

// Create a styled component for the div wrapping the name fields
const NameFieldsContainerStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-self: center;
    gap: 1em;
    width: 100%;
`;

// Increase the max-width of FormContainerStyled
// Override FormContainerStyled by extending it
const OverriddenFormContainerStyled = styled(FormContainerStyled)`
    max-width: 400px; // Override the max-width

    @media (max-width: 550px) {
        max-width: 300px;
    }
`;

const registerValidationSchema = Yup.object({
    firstname: nameValidation("First name").required("First name is required"),
    lastname: nameValidation("Last name").required("Last name is required"),
    email: emailValidation,
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
});

const RegisterForm = () => {
    const navigate = useNavigate();

    const [formLoading, setFormLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const firstnameRef = useRef(null);
    const lastnameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const confirmPasswordRef = useRef(null);
    const fieldRefs = [firstnameRef, lastnameRef, emailRef, passwordRef, confirmPasswordRef];
    const {handleKeyDown} = useFormNavigation(fieldRefs);

    const handleSubmit = async (values, {setSubmitting}) => {
        try {
            setFormLoading(true);
            setSubmitting(true);
            await authService.register(values);
            // Pass the email to the verified account page via location state
            navigate(routesPaths.VERIFY_ACCOUNT, {state: {email: values.email}});
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setFormLoading(false);
            setSubmitting(false);
        }
    };

    return (
        <>
            <Overlay isVisible={formLoading || googleLoading}/>
            <HeightTransitionContainer overflowHidden keyProp="SignUp">
                <OverriddenFormContainerStyled>
                    <FormHeaderStyled>Sign Up</FormHeaderStyled>

                    <HeightTransitionContainer overflowHiddenkeyProp={errorMessage}>
                        {errorMessage && (
                            <ErrorMessageStyled>
                                <FadeInAnimatedText text={errorMessage}/>
                            </ErrorMessageStyled>
                        )}
                    </HeightTransitionContainer>

                    <Formik
                        initialValues={{firstname: "", lastname: "", email: "", password: "", confirmPassword: ""}}
                        validationSchema={registerValidationSchema}
                        onSubmit={handleSubmit}
                    >
                        {({isSubmitting, isValid}) => (
                            <Form onKeyDown={(e) => handleKeyDown(e, isSubmitting)}>
                                <NameFieldsContainerStyled>
                                    <Field
                                        name="firstname"
                                        component={FirstNameInput}
                                        innerRef={firstnameRef}
                                    />
                                    <Field
                                        name="lastname"
                                        component={LastNameInput}
                                        innerRef={lastnameRef}
                                    />
                                </NameFieldsContainerStyled>

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
                                <Field
                                    name="confirmPassword"
                                    component={PasswordInput}
                                    innerRef={confirmPasswordRef}
                                    placeholder="Confirm Password"
                                    label="Confirm Password"
                                />
                                <SubmitButton
                                    isSubmitting={isSubmitting}
                                    loading={formLoading}
                                    disabled={googleLoading || !isValid}
                                >
                                    Sign Up
                                </SubmitButton>
                            </Form>
                        )}
                    </Formik>

                    <AuthSeparator/>

                    <GoogleLoginButton onClick={() => setGoogleLoading(true)}
                                       setError={setErrorMessage}
                                       onLoadingChange={setGoogleLoading}
                                       disabled={formLoading}
                    />

                    <LinkStyled>
                        <p>Already have an account? <a href={routesPaths.LOGIN}>Sign in</a></p>
                    </LinkStyled>
                </OverriddenFormContainerStyled>
            </HeightTransitionContainer>
        </>
    );
};

export default RegisterForm;
