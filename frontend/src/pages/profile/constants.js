import {FaUser, FaLaptop} from "react-icons/fa";
import {SiAuthelia} from "react-icons/si";

export const TABS = Object.freeze({
    PROFILE_TAB: Object.freeze({id: "profile-tab", label: "Profile", icon: FaUser}),
    PASSWORD_AUTH_TAB: Object.freeze({id: "password-auth-tab", label: "Password/Auth", icon: SiAuthelia}),
    SESSIONS_TAB: Object.freeze({id: "sessions-tab", label: "Sessions", icon: FaLaptop})
});

