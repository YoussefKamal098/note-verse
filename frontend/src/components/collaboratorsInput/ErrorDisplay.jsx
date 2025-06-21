import React from 'react';
import PropTypes from 'prop-types';
import {HeightTransitionContainer} from '../animations/ContainerAnimation';
import {FadeInAnimatedText} from '../animations/TextAnimation';
import {ErrorMessageStyles} from './styles';

const ErrorDisplay = ({errorMessage}) => (
    <HeightTransitionContainer keyProp={errorMessage}>
        {errorMessage && (
            <ErrorMessageStyles>
                <FadeInAnimatedText text={errorMessage}/>
            </ErrorMessageStyles>
        )}
    </HeightTransitionContainer>
);

ErrorDisplay.propTypes = {
    errorMessage: PropTypes.string
};

export default React.memo(ErrorDisplay);
