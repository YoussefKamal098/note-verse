import React from 'react';
import PropTypes from 'prop-types';
import {InputStyles, PlaceholderStyles} from './styles';

const InputField = React.forwardRef(({
                                         inputEmail,
                                         handleChange,
                                         handleKeyDown,
                                         placeholder,
                                         isDisabled,
                                         hasCollaborators
                                     }, ref) => (
    <>
        <InputStyles
            ref={ref}
            type="text"
            value={inputEmail}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
        />

        {!inputEmail && hasCollaborators && (
            <PlaceholderStyles>
                {placeholder}
            </PlaceholderStyles>
        )}
    </>
));

InputField.propTypes = {
    inputEmail: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    handleKeyDown: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    isDisabled: PropTypes.bool,
    hasCollaborators: PropTypes.bool
};

export default React.memo(InputField);
