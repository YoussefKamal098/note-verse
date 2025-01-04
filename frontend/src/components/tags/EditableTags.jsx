import React from "react";
import styled from "styled-components";
import TagsInput from "./TagsInput";
import EditableTagsList from "./EditableTagsList";

const TagsContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1em;
`;

function EditableTags({ tags, setTags }){
    return (
        <TagsContainerStyled>
            <TagsInput tags={tags} setTags={setTags} />
            <EditableTagsList tags={tags} setTags={setTags}/>
        </TagsContainerStyled>
    )
}

export default EditableTags
