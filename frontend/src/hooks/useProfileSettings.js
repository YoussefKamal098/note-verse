import {useCallback, useEffect, useMemo, useState} from "react";
import * as Yup from "yup";
import {useAuth} from "@/contexts/AuthContext";
import {useToastNotification} from "@/contexts/ToastNotificationsContext";
import {nameValidation} from "@/validations/userValidation";
import userService from "@/api/userService";

export const updateUserInfoSchema = Yup.object({
    firstname: nameValidation("First name").required("First name must be not empty"),
    lastname: nameValidation("Last name").required("Last name must be not empty"),
});

export default function useProfileSettings() {
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

    return {
        user,
        userImageUrl,
        initialValues,
        onSaveImage,
        handleRemoveImage,
        handleSubmit,
        hasChanged,
    };
}
