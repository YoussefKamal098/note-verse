import React from "react";
import LoadingEffect from "../common/LoadingEffect";
import {SubmitButtonStyled} from "./formStyles";

const SubmitButton = ({isSubmitting, loading, children}) => {
    return (
        <SubmitButtonStyled type="submit" disabled={isSubmitting || loading}>
            {loading ? (<LoadingEffect color="var(--color-background)" loading={loading} size={19}/>) : children}
        </SubmitButtonStyled>
    )
}

export default SubmitButton;
