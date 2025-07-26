import React from "react";
import InputField from "./InputField";
import {FaIdCard} from "react-icons/fa";

const LastNameInput = (props) => {
    const {label, placeholder, showIcon = true} = props;

    return (
        <InputField
            {...props}
            label={label || "Last Name"}
            placeholder={placeholder || "Enter your last name"}
            Icon={showIcon ? FaIdCard : undefined}
        />
    );
};

export default LastNameInput;
