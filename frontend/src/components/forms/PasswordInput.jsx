import React from "react";
import {TbPasswordUser} from "react-icons/tb";
import InputField from "./InputField";

const PasswordInput = (props) => {
    const {label, placeholder} = props;

    return (
        <InputField
            {...props} label={label || "Password"}
            type="password"
            placeholder={placeholder || "Enter your password"}
            Icon={TbPasswordUser} isSensitive={true}
        />
    );
};

export default PasswordInput;
