import React from "react";
import {CircleStyled, SvgLoaderStyled} from "./styles";

const Loader = React.memo(() => (
    <SvgLoaderStyled viewBox="0 0 50 50">
        <CircleStyled cx="25" cy="25" r="24" fill="none" strokeWidth="1"/>
    </SvgLoaderStyled>
));

export default Loader;
