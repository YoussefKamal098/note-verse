import React from "react";
import {useNavigate} from "react-router-dom";
import {TABS} from "../constants";
import {AnimatedTab} from "../animations";
import routesPaths from "@/constants/routesPaths";
import {SectionTitle, Message, BackButton, InvalidTabContainer} from "../styles";

const InvalidTab = () => {
    const navigate = useNavigate();

    return (
        <AnimatedTab key="invalid-tab">
            <InvalidTabContainer>
                <SectionTitle>Invalid Tab</SectionTitle>
                <Message>
                    The tab you're trying to access doesn't exist.
                    Please select a valid tab from the navigation.
                </Message>
                <BackButton
                    onClick={() => navigate(routesPaths.PROFILE_TAB(TABS.PROFILE_TAB.id))}
                >
                    Back to Profile
                </BackButton>
            </InvalidTabContainer>
        </AnimatedTab>
    );
};

export default InvalidTab;
