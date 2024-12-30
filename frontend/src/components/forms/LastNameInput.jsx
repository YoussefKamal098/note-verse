import React from "react";
import InputField from "./InputField";
import { FaRegUser } from "react-icons/fa";

const LastNameInput = (props) => {
    const { label, placeholder } = props;

    return (
        <InputField
            {...props}
            label={label || "Last Name"}
            placeholder={placeholder || "Enter your last name"}
            Icon={FaRegUser}
        />
    );
};

export default LastNameInput;
