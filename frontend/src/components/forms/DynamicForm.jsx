import React, { useState } from "react";
import { Formik, Form, Field } from "formik";
import { FadeInAnimatedText } from "../animations/TextAnimation";
import { HeightTransitionContainer } from "../animations/ContainerAnimation";
import { FormContainerStyled, FormHeaderStyled, ErrorMessageStyled, LinkStyled } from "./formStyles";
import SubmitButton from "./SubmitButtom";
import { useFormNavigation } from "../../hooks";

const DynamicForm = ({
                         formHeader,
                         initialValues,
                         validationSchema,
                         onSubmit,
                         fields,
                         submitButtonText,
                         linkText,
                         linkHref,
                         errorMessage,
                         autoFocusFieldIndex
                     }) => {
    const [loading, setLoading] = useState(false);
    const fieldRefs = fields.map(() => React.createRef());
    const { handleKeyDown } = useFormNavigation(fieldRefs);

    return (
        <HeightTransitionContainer keyProp={formHeader}>
            <FormContainerStyled>
                <FormHeaderStyled>{formHeader}</FormHeaderStyled>

                <HeightTransitionContainer keyProp={errorMessage}>
                    {errorMessage && (
                        <ErrorMessageStyled>
                            <FadeInAnimatedText text={errorMessage} />
                        </ErrorMessageStyled>
                    )}
                </HeightTransitionContainer>

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, actions) => {
                        setLoading(true);
                        await onSubmit(values, actions);
                        setLoading(false);
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form onKeyDown={(event) => handleKeyDown(event, isSubmitting)}>
                            {fields.map((FieldComponent, index) => (
                                <Field
                                    key={index}
                                    name={FieldComponent.name}
                                    component={FieldComponent.component}
                                    innerRef={fieldRefs[index]}
                                    autoFocus={index === autoFocusFieldIndex}
                                    {...FieldComponent.props}
                                />
                            ))}
                            <SubmitButton isSubmitting={isSubmitting} loading={loading}>
                                {submitButtonText}
                            </SubmitButton>
                        </Form>
                    )}
                </Formik>

                {linkHref && (
                    <LinkStyled>
                        <p>{linkText}</p>
                        <a href={linkHref}>{linkHref.includes("register") ? "Register here" : "Login here"}</a>
                    </LinkStyled>
                )}
            </FormContainerStyled>
        </HeightTransitionContainer>
    );
};

export default DynamicForm;
