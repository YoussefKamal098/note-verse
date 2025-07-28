import React from 'react';
import {PinStatusContainerStyles} from './Styles';
import {RiPushpin2Fill, RiUnpinLine} from 'react-icons/ri';

const PinStatus = React.memo(({isPinned, onClick}) => (
    <PinStatusContainerStyles $isPinned={isPinned} onClick={onClick}>
        {isPinned ? <RiPushpin2Fill/> : <RiUnpinLine/>}
    </PinStatusContainerStyles>
));

export default PinStatus;
