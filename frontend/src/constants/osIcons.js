import {SiLinux, SiIos, SiApple} from 'react-icons/si';
import {FaWindows, FaLinux} from 'react-icons/fa';
import {GrAndroid} from "react-icons/gr";

const OS_ICONS = {
    Windows: FaWindows,
    macOS: SiApple,
    Linux: SiLinux,
    Android: GrAndroid,
    iOS: SiIos,
    Ubuntu: FaLinux,
    Fedora: FaLinux,
    Debian: FaLinux
};

export default OS_ICONS;
