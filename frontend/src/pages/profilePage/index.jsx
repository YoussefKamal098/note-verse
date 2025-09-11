import React from "react";
import {useNavigate, Outlet, useLocation, useParams} from "react-router-dom";
import {AnimatePresence} from "framer-motion";
import Navbar from "../../components/navbar/Navbar";
import Tabs from "@/components/tabs";
import routesPaths from "@/constants/routesPaths";
import {TABS} from "./constants";
import {PageWrapper, ProfileHeader, TabContent, TabsContainer} from "./styles";


const ProfilePage = () => {
    const {tab} = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Get current tab from URL
    const currentTab = tab || TABS.PROFILE_TAB.id;

    const handleTabChange = (newTab) => {
        navigate(routesPaths.PROFILE_TAB(newTab));
    };

    // Map icon names to actual components
    const tabList = Object.values(TABS).map(tab => ({
        ...tab,
        icon: <tab.icon/>
    }));

    return (
        <div className="page">
            <Navbar/>
            <PageWrapper>
                <ProfileHeader>Account Settings</ProfileHeader>

                <TabsContainer>
                    <Tabs
                        tabs={tabList}
                        activeTab={currentTab}
                        onTabChange={handleTabChange}
                        containerStyles={{
                            padding: "0",
                            borderBottom: "2px solid var(--color-border)",
                            minWidth: "max-content"
                        }}
                        tabStyles={{minWidth: "125px", maxWidth: "180px"}}
                    />
                </TabsContainer>

                <TabContent>
                    <AnimatePresence mode="wait">
                        <Outlet context={{key: location.pathname}}/>
                    </AnimatePresence>
                </TabContent>
            </PageWrapper>
        </div>
    );
};

export default ProfilePage;
