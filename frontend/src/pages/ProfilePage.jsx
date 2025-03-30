import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useAuth} from "../contexts/AuthContext";
import {useToastNotification} from "../contexts/ToastNotificationsContext";
import useRequestManager from '../hooks/useRequestManager';
import Navbar from "../components/navbar/Navbar";
import ProfileImageUploader from "../components/profileImageUploader/ProfileImageUploader";
import userService from "../api/userService";
import {API_CLIENT_ERROR_CODES} from "../api/apiClient";

const ProfileImageSection = styled.div`
    height: 175px;
    display: flex;
    justify-content: start;
    align-items: center;
    padding: 0.5rem;
    gap: 1.5rem;
`;

const ProfileHeader = styled.div`
    font-size: 2.5rem;
    font-weight: bold;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
`;

const ProfilePage = () => {
    const {user} = useAuth();
    const {notify} = useToastNotification();
    const [userImageUrl, setUserImageUrl] = useState("");
    const {createAbortController} = useRequestManager();

    // Fetch user details on component mount
    useEffect(() => {
        if (user) {
            const fetchUserData = async () => {
                const controller = createAbortController();

                try {
                    const response = await userService.getUser("me", {signal: controller.signal});
                    setUserImageUrl(response?.data?.avatarUrl || "");
                } catch (error) {
                    if (error.code !== API_CLIENT_ERROR_CODES.ERR_CANCELED) {
                        notify.error(`Failed to fetch user details, ${error.message}`);
                    }
                }
            };

            fetchUserData();
        }
    }, [user, notify]);

    const onSaveImage = async ({file}) => {
        const result = await userService.uploadAvatar("me", file);
        return result?.data.avatarUrl;
    };

    return (
        <div className="page">
            <Navbar/>

            <div className="wrapper">
                <ProfileHeader> Profile </ProfileHeader>
                <ProfileImageSection>
                    <ProfileImageUploader onSaveImage={onSaveImage} imageUrl={userImageUrl}/>
                </ProfileImageSection>
            </div>
        </div>
    );
};

export default ProfilePage;
