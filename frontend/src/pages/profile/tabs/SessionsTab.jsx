import React from "react";
import {useOutletContext} from "react-router-dom";
import {AnimatedTab} from "../animations";
import {SectionTitle} from "../styles";

const SessionsTab = () => {
    const {key} = useOutletContext();

    return (
        <AnimatedTab key={key}>
            <SectionTitle>Active Sessions</SectionTitle>
        </AnimatedTab>
    );
};

export default React.memo(SessionsTab);
