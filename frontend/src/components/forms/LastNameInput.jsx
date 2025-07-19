import React from "react";
import InputField from "./InputField";
import {GiMustache} from "react-icons/gi";

const LastNameInput = (props) => {
    const {label, placeholder, showIcon = true} = props;

    return (
        <InputField
            {...props}
            label={label || "Last Name"}
            placeholder={placeholder || "Enter your last name"}
            Icon={showIcon ? GiMustache : undefined}
        />
    );
};

export default LastNameInput;
