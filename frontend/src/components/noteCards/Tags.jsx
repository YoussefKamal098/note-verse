import React from 'react';
import {TagsContainerStyles, TagStyles, TagsWrapperStyles} from './Styles';

const NoteTags = React.memo(({tags}) => (
    <TagsWrapperStyles>
        <TagsContainerStyles>
            {tags.map((tag, index) => (
                <TagStyles key={`${tag}-${index}`}>
                    <span>#</span>{tag}
                </TagStyles>
            ))}
        </TagsContainerStyles>
    </TagsWrapperStyles>
));

export default NoteTags;
