import React, {useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import {HeightTransitionContainer} from "@/components/animations/ContainerAnimation";
import {FadeInAnimatedText} from "@/components/animations/TextAnimation";
import Overlay from "@/components/common/Overlay";
import useFormNavigation from "@/hooks/useFormNavigation";
import SubmitButton from "./SubmitButtom";
import GoogleLoginButton from "./GoogleLoginButton";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import AuthSeparator from "./AuthSeparator";
import AuthService from "@/api/authService";
import routesPaths from "@/constants/routesPaths";
import {FieldTypes, requiredField} from "@/validations/fieldTypeValidators";
import {emailValidation} from "@/validations/userValidation";
import {ErrorMessageStyled, FormContainerStyled, FormHeaderStyled, LinkStyled} from "./Styles";

const loginValidationSchema = Yup.object({
    email: emailValidation,
    password: requiredField("password", FieldTypes.STRING),
});

const LoginForm = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formLoading, setFormLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const emailRef = useRef(null);
    const passwordRef = useRef(null);
    const fieldRefs = [emailRef, passwordRef];
    const {handleKeyDown} = useFormNavigation(fieldRefs);

    const from = location.state?.from?.pathname || routesPaths.HOME;
    
    const handleFromSubmit = async (values, {setSubmitting}) => {
        try {
            setFormLoading(true);
            await AuthService.login(values);
            navigate(from, {replace: true});
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setSubmitting(false);
            setFormLoading(false);
        }
    };

    return (
        <>
            <Overlay isVisible={formLoading || googleLoading}/>
            <HeightTransitionContainer overflowHidden keyProp="Login">
                <FormContainerStyled>
                    <FormHeaderStyled>Sign In</FormHeaderStyled>

                    <HeightTransitionContainer overflowHidden keyProp={errorMessage}>
                        {errorMessage && (
                            <ErrorMessageStyled>
                                <FadeInAnimatedText text={errorMessage}/>
                            </ErrorMessageStyled>
                        )}
                    </HeightTransitionContainer>

                    <Formik
                        initialValues={{email: "", password: ""}}
                        validationSchema={loginValidationSchema}
                        onSubmit={handleFromSubmit}
                    >
                        {({isSubmitting, isValid}) => (
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
                                <SubmitButton
                                    isSubmitting={isSubmitting}
                                    loading={formLoading}
                                    disabled={googleLoading || !isValid}
                                >
                                    Log in
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
                        <p>Don't have an account? <a href={routesPaths.REGISTER}>Sign up</a></p>
                    </LinkStyled>
                </FormContainerStyled>
            </HeightTransitionContainer>
        </>
    );
};

export default LoginForm;
