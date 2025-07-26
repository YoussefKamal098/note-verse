import React from 'react';
import CloseButton from "@/components/buttons/CloseButton";
import {PopUpHeaderStyles} from "./styles"

const Header = ({onClose}) => {
    return (
        <PopUpHeaderStyles>
            <h3>Share with people and groups</h3>
            <CloseButton onClick={onClose}/>
        </PopUpHeaderStyles>
    );
};

export default React.memo(Header);
