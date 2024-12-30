import React from "react";
import InputField from "./InputField";
import { TbPasswordUser } from "react-icons/tb";

const PasswordInput = (props) => {
    const { label, placeholder} = props;

    return (
        <InputField
            {...props} label={ label ||  "Password"}
            type="password"
            placeholder= { placeholder || "Enter your password" }
            Icon={TbPasswordUser} isSensitive={true}
        />
    );
};

export default PasswordInput;
