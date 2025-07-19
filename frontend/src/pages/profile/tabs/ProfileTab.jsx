import React, {useCallback, useEffect, useState, useMemo} from "react";
import {useOutletContext} from "react-router-dom";
import {Field, Form, Formik} from "formik";
import * as Yup from "yup";
import ProfileImageUploader from "@/components/profileImageUploader/ProfileImageUploader";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import FirstNameInput from "@/components/forms/FirstNameInput";
import LastNameInput from "@/components/forms/LastNameInput";
import {nameValidation} from "@/validations/userValidation";
import {useAuth} from "@/contexts/AuthContext";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {AnimatedTab} from "../animations";
import userService from "@/api/userService";
import {ProfileImageSection, RemoveButtonWrapper} from "../styles";

const updateUserInfoSchema = Yup.object({
    firstname: nameValidation("First name").required("First name must be not empty"),
    lastname: nameValidation("Last name").required("Last name must be not empty"),
});

const ProfileTab = () => {
    const {key} = useOutletContext();
    const {user, setUser} = useAuth();
    const {notify} = useToastNotification();
    const [userImageUrl, setUserImageUrl] = useState(user?.avatarUrl || "");
    const [initialValues, setInitialValues] = useState({
        firstname: "",
        lastname: ""
    });

    // Memoize the initial user values
    const userInitialValues = useMemo(() => ({
        firstname: user?.firstname || "",
        lastname: user?.lastname || ""
    }), [user]);

    useEffect(() => {
        setUserImageUrl(user?.avatarUrl || "");
        setInitialValues(userInitialValues);
    }, [user, userInitialValues]);

    const handleSubmit = async (values, {setSubmitting, resetForm}) => {
        if (!user?.id) {
            notify.error("User not available");
            return;
        }

        try {
            await userService.updateProfile("me", values);
            setInitialValues(values);
            setUser(prev => ({...prev, ...values}));
            notify.success("Profile updated successfully");
        } catch (error) {
            resetForm({values: userInitialValues});
            notify.error(error.message || "Failed to update profile");
            console.error("Update failed:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const onSaveImage = useCallback(async ({file}) => {
        if (!user?.id) {
            notify.error("User not available");
            return;
        }

        try {
            const result = await userService.uploadAvatar("me", file);
            const newAvatarUrl = result?.data.avatarUrl || "";

            setUserImageUrl(newAvatarUrl);
            setUser(prev => ({...prev, avatarUrl: newAvatarUrl}));
            notify.success("Profile image updated");
        } catch (error) {
            setUserImageUrl(user?.avatarUrl || "");
            notify.error(error.message || "Failed to update profile image");
            console.error("Image upload failed:", error);
        }
    }, [user, notify]);

    const handleRemoveImage = useCallback(async () => {
        try {
            if (!user?.id) {
                notify.error("User not available");
                return;
            }

            setUserImageUrl("");
            await userService.removeAvatar("me");
            setUser(prev => ({...prev, avatarUrl: ""}));
            notify.success("Profile image removed successfully");
        } catch (error) {
            setUserImageUrl(user?.avatarUrl || "");
            notify.error(error.message || "Failed to remove profile image");
            console.error("Failed to remove image:", error);
        }
    }, [user, notify]);

    const hasChanged = (currentValues) => {
        return (
            currentValues.firstname !== userInitialValues.firstname ||
            currentValues.lastname !== userInitialValues.lastname
        );
    };

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
