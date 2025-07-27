import React from "react";
import {useOutletContext} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import ProfileImageUploader from "@/components/profileImageUploader";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import FirstNameInput from "@/components/forms/FirstNameInput";
import LastNameInput from "@/components/forms/LastNameInput";
import {AnimatedTab} from "../animations";
import useProfileSettings, {updateUserInfoSchema} from "@/hooks/useProfileSettings";
import {ProfileImageSection, RemoveButtonWrapper} from "../styles";

const ProfileTab = () => {
    const {key} = useOutletContext();
    const {
        user,
        userImageUrl,
        initialValues,
        onSaveImage,
        handleRemoveImage,
        handleSubmit,
        hasChanged
    } = useProfileSettings();

    return (
        <AnimatedTab key={key}>
            <ProfileImageSection>
                <ProfileImageUploader imageUrl={userImageUrl} onSaveImage={onSaveImage}/>
                <RemoveButtonWrapper>
                    <Button
                        type={BUTTON_TYPE.DANGER}
                        onClick={handleRemoveImage}
                        disabled={!user?.avatarUrl || !userImageUrl}
                    >
                        Remove
                    </Button>
                </RemoveButtonWrapper>
            </ProfileImageSection>

            <Formik
                initialValues={initialValues}
                validationSchema={updateUserInfoSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({isSubmitting, values, isValid}) => {
                    const isDisabled =
                        !hasChanged(values) ||
                        !isValid ||
                        isSubmitting ||
                        !user ||
                        !values.firstname ||
                        !values.lastname;

                    return (
                        <Form>
                            <Field
                                name="firstname"
                                component={FirstNameInput}
                                showIcon={false}
                                hoverColor="var(--color-primary)"
                            />
                            <Field
                                name="lastname"
                                component={LastNameInput}
                                showIcon={false}
                                hoverColor="var(--color-primary)"
                            />
                            <Button
                                buttonType="submit"
                                type={BUTTON_TYPE.INFO}
                                disabled={isDisabled}
                                loading={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save changes"}
                            </Button>
                        </Form>
                    );
                }}
            </Formik>
        </AnimatedTab>
    );
};

export default React.memo(ProfileTab);
