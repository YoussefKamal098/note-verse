import React from "react";
import InputField from "./InputField";
import {FaUser} from "react-icons/fa";

const LastNameInput = (props) => {
    const {label, placeholder, showIcon = true} = props;

    return (
        <InputField
            {...props}
            label={label || "Last Name"}
            placeholder={placeholder || "Enter your last name"}
            Icon={showIcon ? FaUser : undefined}
        />
    );
};

export default LastNameInput;
