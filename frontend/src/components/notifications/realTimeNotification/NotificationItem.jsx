import React from 'react';
import {useNavigate} from 'react-router-dom';
import {formatSocialDate} from '@/utils/date';
import {NOTIFICATION_ICONS} from './constant';
import {notificationsRenderer} from './NotificationRenderers';
import CloseButton from '@/components/buttons/CloseButton';
import {
    NotificationItem as ItemContainer,
    NotificationIcon,
    NotificationContent,
    NotificationTitle,
    NotificationDetails,
    NotificationTime,
} from './styles';

const NotificationItem = ({notification, onMarkAsRead, onClose}) => {
    const navigate = useNavigate();
    const {type, payload, read, createdAt, id} = notification;

    const notificationType = notificationsRenderer(notification);
    if (!notificationType) return null;

    const {avatarRender: NotificationAvatar, bodyRender: NotificationBody, title, redirect} = notificationType;
    const Icon = NOTIFICATION_ICONS[type];

    const handleClick = async () => {
        if (redirect && !notification.read) {
            await onMarkAsRead?.(id);
            navigate(redirect);
        }
    };

    return (
        <ItemContainer unread={!read} onClick={handleClick}>
            <NotificationIcon>
                <NotificationAvatar payload={payload} Icon={Icon}/>
            </NotificationIcon>

            <NotificationContent>
                <NotificationTitle>
                    {title}
                    {onClose && (
                        <CloseButton
                            size="1.5em"
                            color="var(--color-primary)"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                        />
                    )}
                </NotificationTitle>

                <NotificationDetails>
                    <NotificationBody payload={payload}/>
                </NotificationDetails>

                <NotificationTime>
                    {formatSocialDate(createdAt)}
                </NotificationTime>
            </NotificationContent>
        </ItemContainer>
    );
};

export default React.memo(NotificationItem);
