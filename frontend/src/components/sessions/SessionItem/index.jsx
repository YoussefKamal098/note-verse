import React from "react";
import PropTypes from "prop-types";
import {getDeviceIcon, getBrowserIcon, getOSIcon} from "@/utils/iconUtils";
import {formatSocialDate} from "@/utils/date";
import {parseIp} from '@/utils/ipUtils';
import {parseUserAgent} from '@/utils/userAgent';
import {useGeoLocation} from "@/hooks/useGeoLocation";
import Button, {BUTTON_TYPE} from "@/components/buttons/Button";
import CurrentSessionMarker from "../CurrentSessionMarker";
import Badge from "../Badge";
import {
    SessionCard,
    DeviceInfo,
    DeviceIcon,
    SessionDetails,
    SessionHeader,
    SessionRow,
    SessionMeta,
    SessionDates,
    SessionAction,
    IconContainer,
    LoadingRibbon
} from "./styles";

const SessionItem = ({session, onRevoke, isCurrent}) => {
    const {ip, version: ipVersion} = parseIp(session.ip);
    const {location, loading: locationLoading} = useGeoLocation(session.ip);
    const isActive = new Date(session.expiredAt) > new Date();
    const {info: userAgentInfo} = parseUserAgent(session.userAgent);

    return (
        <SessionCard $revoked={session.isRevoked}>
            <DeviceInfo>
                <DeviceIcon>
                    {getDeviceIcon(userAgentInfo?.device.type || 'Desktop')}
                </DeviceIcon>
                <div>{userAgentInfo?.device.type || 'Desktop'}</div>
            </DeviceInfo>

            <SessionDetails>
                <SessionHeader>
                    <SessionRow>
                        <strong>
                            {userAgentInfo?.browser.name} on {userAgentInfo?.os.name}
                            {userAgentInfo?.device.model && ` (${userAgentInfo.device.model})`}
                        </strong>
                        <IconContainer>
                            {getBrowserIcon(userAgentInfo?.browser.name)}
                            {getOSIcon(userAgentInfo?.os.name)}
                        </IconContainer>
                    </SessionRow>

                    <SessionMeta>
                        <div>{ip} ({ipVersion})</div>
                        <div>
                            {locationLoading ? <LoadingRibbon/> : (
                                `${location?.city || ''}${location?.city && location?.region ? ', ' : ''}${location?.region || ''}${(location?.city || location?.region) && location?.country ? ', ' : ''}${location?.country || ''}`
                            )}
                        </div>
                    </SessionMeta>
                </SessionHeader>

                <SessionDates>
                    {!isCurrent && <div>Last accessed {formatSocialDate(session.lastAccessedAt)}</div>}
                    <div>Created {formatSocialDate(session.createdAt)}</div>
                </SessionDates>

                {!isCurrent && isActive && (
                    <Button
                        type={session.isRevoked ? BUTTON_TYPE.SECONDARY : BUTTON_TYPE.DANGER}
                        onClick={() => onRevoke?.(session.id)}
                        disabled={session.isRevoked}
                        style={{width: "fit-content"}}
                    >
                        {session.isRevoked ? "Revoked" : "Revoke"}
                    </Button>
                )}
            </SessionDetails>

            <SessionAction>
                {isCurrent ?
                    <CurrentSessionMarker>This device</CurrentSessionMarker> :
                    <Badge active={isActive && !session.isRevoked}>
                        {isActive && !session.isRevoked ? 'Active' : session.isRevoked ? 'Revoked' : 'Expired'}
                    </Badge>
                }
            </SessionAction>
        </SessionCard>
    );
};

SessionItem.propTypes = {
    session: PropTypes.object.isRequired,
    onRevoke: PropTypes.func,
    isCurrent: PropTypes.bool
};

export default React.memo(SessionItem);
