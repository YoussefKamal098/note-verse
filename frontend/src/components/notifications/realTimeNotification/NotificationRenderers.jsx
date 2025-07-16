import React from 'react';
import {useNavigate} from "react-router-dom";
import {TbBrowser} from "react-icons/tb";
import {IoEarth} from "react-icons/io5";
import {PiDevicesBold} from "react-icons/pi";
import {parseUserAgent} from '@/utils/userAgent';
import {useGeoLocation} from "@/hooks/useGeoLocation";
import {NOTIFICATION_TYPES} from './constant';
import BROWSER_ICONS from '@/constants/browserIcons';
import OS_ICONS from '@/constants/osIcons';
import routesPaths from "@/constants/routesPaths"
import Avatar from '@/components/common/Avatar';

import {
    AvatarWrapper,
    LoadingRibbon,
    MediumIcon,
    SmallIcon,
    LargeIcon,
    EditBadge,
    Highlight,
    FlexRow,
    Text,
    Link,
} from './styles';

export const LoginNotification = ({payload}) => {
    const {info} = parseUserAgent(payload.session.userAgent);
    const BrowserIcon = BROWSER_ICONS[info.browser.name] || TbBrowser;
    const OSIcon = OS_ICONS[info.os.name] || PiDevicesBold;
    const {location, loading} = useGeoLocation(payload.session.ip);

    return (
        <Text>
            <FlexRow>
                New login from
                <Highlight>
                    <FlexRow>
                        <SmallIcon>
                            <BrowserIcon/>
                        </SmallIcon>
                        {info.browser.name || "Unknown browser"}
                    </FlexRow>
                </Highlight>
                Browser on
                <Highlight>
                    <FlexRow>
                        <SmallIcon>
                            <OSIcon/>
                        </SmallIcon>
                        {`${info.os.name || "Unknown OS"} (${info.device.type || "Unknown device type"})`}
                    </FlexRow>
                </Highlight>

                <FlexRow style={{width: '100%', marginTop: '4px'}}>
                    {loading ? (
                        <LoadingRibbon/>
                    ) : (
                        <Highlight>
                            <FlexRow>
                                <SmallIcon>
                                    <IoEarth/>
                                </SmallIcon>
                                <span>
                                   {location.country},
                               </span>
                                <span>
                                   {location.city},
                               </span>
                                <span>
                                    {location.region},
                               </span>
                            </FlexRow>
                        </Highlight>
                    )}
                </FlexRow>
            </FlexRow>
        </Text>
    );
};

export const NoteUpdateNotification = ({payload}) => {
    const navigate = useNavigate();

    return (<Text>
        <FlexRow>
            <Highlight>
                {`${payload.user.firstname} ${payload.user.lastname}`}
            </Highlight>
            Updated
            <Highlight>
                <Link onClick={() => navigate(routesPaths.NOTE(payload.note.id))}>
                    "{payload.note.title}"
                </Link>
            </Highlight>
            with a new
            <Highlight>
                <Link onClick={() => navigate(routesPaths.NOTE_VERSION(payload.version.id))}>
                    version
                </Link>
            </Highlight>
        </FlexRow>
    </Text>)
}

export const LoginNotificationAvatar = ({Icon}) => (
    <LargeIcon><Icon/></LargeIcon>
);

export const NoteUpdateNotificationAvatar = ({payload, Icon}) => (
    <AvatarWrapper>
        <Avatar avatarUrl={payload.user?.avatarUrl}/>
        <EditBadge>
            <MediumIcon><Icon/></MediumIcon>
        </EditBadge>
    </AvatarWrapper>
);

export const notificationsRenderer = (notification) => {
    switch (notification.type) {
        case NOTIFICATION_TYPES.LOGIN:
            return {
                bodyRender: LoginNotification,
                avatarRender: LoginNotificationAvatar,
                redirect: routesPaths.PROFILE,
                title: 'Security Alert'
            }

        case NOTIFICATION_TYPES.NOTE_UPDATE:
            return {
                bodyRender: NoteUpdateNotification,
                avatarRender: NoteUpdateNotificationAvatar,
                redirect: routesPaths.NOTE(notification.payload.note.id),
                title: 'Note Update'
            }
        default:
            return null;
    }
};
