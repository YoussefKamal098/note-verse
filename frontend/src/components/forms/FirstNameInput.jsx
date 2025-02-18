import React from "react";
import InputField from "./InputField";
import {SlUser} from "react-icons/sl";

const FirstNameInput = (props) => {
    const {label, placeholder} = props;

    return (
        <InputField
            {...props}
            label={label || "First Name"}
            placeholder={placeholder || "Enter your first name"}
            Icon={SlUser}
        />
    );
};

export default FirstNameInput;
