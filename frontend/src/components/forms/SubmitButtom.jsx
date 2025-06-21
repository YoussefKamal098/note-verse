import React from "react";
import LoadingEffect from "../common/LoadingEffect";
import {SubmitButtonStyled} from "./Styles";

const SubmitButton = ({isSubmitting, loading, disabled, children}) => {
    return (
        <SubmitButtonStyled type="submit" disabled={isSubmitting || loading || disabled}>
            {loading ? (<LoadingEffect color="var(--color-accent)" loading={loading} size={25}/>) : children}
        </SubmitButtonStyled>
    )
}

export default SubmitButton;
