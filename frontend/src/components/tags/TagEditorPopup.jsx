import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {FaTimes} from 'react-icons/fa';
import {AnimatedListHeightChildrenFade} from "../animations/ContainerAnimation";
import TagsInput from './TagsInput';
import EditPopUp from "../editPopUp/EditPopUp";
import noteValidationSchema from "../../validations/noteValidtion";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import {TagsContainerStyled, TagStyled} from "./TagsStyles";

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
    const {notify} = useToastNotification();
    const [editTags, setEditTags] = useState([...tags]);

    const onPopupSave = () => {
        try {
            noteValidationSchema.tags.validateSync(editTags);
            onSave(editTags);
        } catch (error) {
            notify.warn(error.message);
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
            <div style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
                <TagsInput
                    tags={editTags}
                    setTags={setEditTags}
                />

                <TagsContainerStyled>
                    <AnimatedListHeightChildrenFade>
                        {editTags.map((tag, index) => (
                            <TagStyled key={`editable-tag-${index}`}>
                                <span>#</span> {tag}
                                <DeleteTagButtonStyled onClick={() => onTagDelete(tag)}/>
                            </TagStyled>
                        ))}
                    </AnimatedListHeightChildrenFade>
                </TagsContainerStyled>
            </div>
        </EditPopUp>
    );
};

export default TagEditorPopup;
