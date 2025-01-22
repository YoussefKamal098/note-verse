import React from "react";
import InputField from "./InputField";
import {FaRegUser} from "react-icons/fa";

const FirstNameInput = (props) => {
    const {label, placeholder} = props;

    return (
        <InputField
            {...props}
            label={label || "First Name"}
            placeholder={placeholder || "Enter your first name"}
            Icon={FaRegUser}
        />
    );
};

export default FirstNameInput;
