import React from "react";
import InputField from "./InputField";
import {FaUser} from "react-icons/fa";

const FirstNameInput = (props) => {
    const {label, placeholder, showIcon = true} = props;

    return (
        <InputField
            {...props}
            label={label || "First Name"}
            placeholder={placeholder || "Enter your first name"}
            Icon={showIcon ? FaUser : undefined}
        />
    );
};

export default FirstNameInput;
