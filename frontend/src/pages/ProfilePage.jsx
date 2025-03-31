import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useAuth} from "../contexts/AuthContext";
import {useToastNotification} from "../contexts/ToastNotificationsContext";
import Navbar from "../components/navbar/Navbar";
import ProfileImageUploader from "../components/profileImageUploader/ProfileImageUploader";
import userService from "../api/userService";

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

    useEffect(() => {
        setUserImageUrl(user?.avatarUrl || "");
    }, [user, notify]);

    const onSaveImage = async ({file}) => {
        if (!user || !user.id) {
            return "";
        }

        const result = await userService.uploadAvatar(user.id, file);
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
