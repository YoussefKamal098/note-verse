import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '../common/Avatar';
import {AvatarWrapperStyles, EmailStyles, NameStyles, SuggestionContentStyles, SuggestionItemStyles} from './styles';

const SuggestionItem = ({suggestion, isHighlighted, onClick}) => (
    <SuggestionItemStyles
        onClick={onClick}
        $highlighted={isHighlighted}
    >
        <AvatarWrapperStyles>
            <Avatar avatarUrl={suggestion.avatarUrl}/>
        </AvatarWrapperStyles>

        <SuggestionContentStyles>
            <NameStyles>{suggestion.firstname} {suggestion.lastname}</NameStyles>
            <EmailStyles>{suggestion.email}</EmailStyles>
        </SuggestionContentStyles>
    </SuggestionItemStyles>
);

SuggestionItem.propTypes = {
    suggestion: PropTypes.object.isRequired,
    isHighlighted: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

export default React.memo(SuggestionItem);
