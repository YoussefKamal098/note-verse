import React from "react";
import InputField from "./InputField";
import { MdAlternateEmail } from "react-icons/md";

const EmailInput = (props) => {
    const { label, placeholder} = props;

    return (
        <InputField
            {...props}
            label={ label || "Email" }
            type="email"
            placeholder={ placeholder || "Enter your email"}
            Icon={MdAlternateEmail}
        />
    );
};

export default EmailInput;
