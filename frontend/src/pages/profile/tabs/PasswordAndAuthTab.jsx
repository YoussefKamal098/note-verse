import React from "react";
import {useOutletContext} from "react-router-dom";
import {AnimatedTab} from "../animations";
import {SectionTitle} from "../styles";

const PasswordAndAuthTab = () => {
    const {key} = useOutletContext();

    return (
        <AnimatedTab key={key}>
            <SectionTitle>Password & Authentication</SectionTitle>
        </AnimatedTab>
    );
};

export default React.memo(PasswordAndAuthTab);
