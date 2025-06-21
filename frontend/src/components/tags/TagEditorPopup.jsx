import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaTimes} from 'react-icons/fa';
import {AnimatedListWidthChildrenFade} from "../animations/ContainerAnimation";
import TagsInput from './TagsInput';
import EditPopUp from "../editPopUp/EditPopUp";
import {TagsContainerStyled, TagStyled} from "./TagsStyles";
import useNoteValidation from "../../hooks/useNoteValidation";

const ContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1em;
`;

const DeleteTagButtonStyled = styled(FaTimes)`
    cursor: pointer;
    color: var(--color-danger);
    font-size: 1em;
    transition: color 0.3s;

    &:hover {
        color: var(--color-danger-hover);
    }
`;

const TagEditorPopup = ({tags, onSave, children}) => {
    const {validateTags} = useNoteValidation();
    const [editTags, setEditTags] = useState([...tags]);

    const onPopupSave = () => {
        if (validateTags(editTags)) {
            onSave(editTags);
        }
    };

    useEffect(() => {
        setEditTags(tags);
    }, [tags]);

    const onTagDelete = (tag) => {
        setEditTags((prevTags) => {
            return prevTags.filter((t) => t !== tag);
        });
    }

    return (
        <EditPopUp
            title={"Edit Tags"}
            onSave={onPopupSave}
            openElement={children}
        >
            <ContainerStyled>
                <TagsInput
                    tags={editTags}
                    setTags={setEditTags}
                />

                <TagsContainerStyled>
                    <AnimatedListWidthChildrenFade>
                        {editTags.map((tag, index) => (
                            <TagStyled key={`editable-tag-${index}`}>
                                <span>#</span> {tag}
                                <DeleteTagButtonStyled onClick={() => onTagDelete(tag)}/>
                            </TagStyled>
                        ))}
                    </AnimatedListWidthChildrenFade>
                </TagsContainerStyled>
            </ContainerStyled>
        </EditPopUp>
    );
};

export default React.memo(TagEditorPopup);
