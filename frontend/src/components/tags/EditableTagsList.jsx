import React from 'react';
import styled from 'styled-components';
import {FaTimes} from 'react-icons/fa';
import {AnimatedListHeightChildrenFade} from "../animations/ContainerAnimation";

const TagStyled = styled.span`
    color: var(--color-text);
    box-shadow: var(--box-shadow);
    border-radius: var(--border-radius);
    border: var(--border-width) solid var(--color-border-secondary);
    padding: 0.1em 0.4em;
    font-size: 0.75em;
    font-weight: 600;
    display: flex;
    align-items: center;
    transition: scale 0.3s;
    gap: 0.3em;

    span {
        font-size: 1.3em;
        font-weight: bold;
        color: var(--color-accent);
    }

    &:hover {
        scale: 1.1;
    }
`;

const TagsContainerStyled = styled.div`
    display: flex;
    flex-wrap: wrap;
    max-width: 25em;
    gap: 0.5em;
`;

const CloseButtonStyled = styled(FaTimes)`
    cursor: pointer;
    color: var(--color-danger);
    font-size: 1em;
    transition: color 0.3s;

    &:hover {
        color: var(--color-danger-hover);
    }
`;

const EditableTagsList = ({tags, setTags}) => {
    const onTagDelete = (tag) => {
        setTags((prevTags) => {
            return prevTags.filter((t) => t !== tag);
        });
    }

    return (
        <TagsContainerStyled>
            <AnimatedListHeightChildrenFade>
                {tags.map((tag, index) => (
                    <TagStyled key={`editable-tag-${index}`}>
                        <span>#</span> {tag} {setTags && <CloseButtonStyled onClick={() => onTagDelete(tag)}/>}
                    </TagStyled>
                ))}
            </AnimatedListHeightChildrenFade>
        </TagsContainerStyled>
    );
};

export default EditableTagsList;
