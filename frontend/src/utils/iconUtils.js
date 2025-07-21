import DEVICE_ICONS from "@/constants/deviceIcon";
import BROWSER_ICONS from "@/constants/browserIcons";
import OS_ICONS from "@/constants/osIcons";

export const getOSIcon = (osName) => {
    const OS = osName?.split(' ')[0];
    const Icon = OS_ICONS[OS] || OS_ICONS.Linux;
    return Icon ? <Icon/> : null;
};

export const getDeviceIcon = (deviceType) => {
    const Icon = DEVICE_ICONS[deviceType?.toLowerCase()] || DEVICE_ICONS.desktop;
    return <Icon/>;
};

export const getBrowserIcon = (browserName) => {
    const Icon = BROWSER_ICONS[browserName] || BROWSER_ICONS.Chrome;
    return <Icon/>;
};
