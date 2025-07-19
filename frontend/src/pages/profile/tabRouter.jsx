import React from "react";
import {useParams} from "react-router-dom";
import {TABS} from "./constants";

import ProfileTab from "./tabs/ProfileTab";
import SessionsTab from "./tabs/SessionsTab";
import PasswordAndAuthTab from "./tabs/PasswordAndAuthTab";
import InvalidTab from "./tabs/InvalidTab";

const tabMap = {
    [TABS.PROFILE_TAB.id]: <ProfileTab/>,
    [TABS.SESSIONS_TAB.id]: <SessionsTab/>,
    [TABS.PASSWORD_AUTH_TAB.id]: <PasswordAndAuthTab/>,
};

const TabRouter = () => {
    const {tab} = useParams();
    return tabMap[tab] || <InvalidTab/>;
};

export default TabRouter;
