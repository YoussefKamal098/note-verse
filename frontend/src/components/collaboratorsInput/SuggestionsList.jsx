import React from 'react';
import PropTypes from 'prop-types';
import {AnimatePresence} from 'framer-motion';
import SuggestionItem from './SuggestionItem';
import {SuggestionsListStyles} from './styles';

const SuggestionsList = ({
                             showSuggestions,
                             filteredSuggestions,
                             highlightedIndex,
                             handleSuggestionClick
                         }) => {
    return (<AnimatePresence>
            {showSuggestions && filteredSuggestions.length > 0 && (
                <SuggestionsListStyles
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -10}}
                >
                    {filteredSuggestions.map((suggestion, index) => (
                        <SuggestionItem
                            key={suggestion.id}
                            suggestion={suggestion}
                            isHighlighted={index === highlightedIndex}
                            onClick={() => handleSuggestionClick(suggestion.id)}
                        />
                    ))}
                </SuggestionsListStyles>
            )}
        </AnimatePresence>
    );
}

SuggestionsList.propTypes = {
    showSuggestions: PropTypes.bool,
    filteredSuggestions: PropTypes.array,
    highlightedIndex: PropTypes.number,
    handleSuggestionClick: PropTypes.func.isRequired
};

export default React.memo(SuggestionsList);
