import React from "react";
import InputField from "./InputField";
import {GiMustache} from "react-icons/gi";

const LastNameInput = (props) => {
    const {label, placeholder} = props;

    return (
        <InputField
            {...props}
            label={label || "Last Name"}
            placeholder={placeholder || "Enter your last name"}
            Icon={GiMustache}
        />
    );
};

export default LastNameInput;
