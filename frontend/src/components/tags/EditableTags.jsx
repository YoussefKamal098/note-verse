import React from "react";
import styled from "styled-components";
import {AnimatedListWidthChildrenFade} from "../animations/ContainerAnimation";
import {TagsContainerStyled, TagStyled} from "./TagsStyles";
import TagEditorPopup from "./TagEditorPopup";
import Tooltip from "../tooltip/Tooltip";
import {TbEditCircle} from "react-icons/tb";

const ContainerStyled = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-wrap: wrap;
    gap: 1em;
`;

function EditableTags({tags, canEdit = true, onSave = (tags) => ({tags})}) {
    return (
        <ContainerStyled>
            <TagsContainerStyled>
                <AnimatedListWidthChildrenFade>
                    {tags.map((tag, index) => (
                        <TagStyled key={`tag-${index}`}>
                            <span>#</span> {tag}
                        </TagStyled>
                    ))}
                </AnimatedListWidthChildrenFade>

                <TagEditorPopup
                    tags={tags}
                    onSave={onSave}
                >
                    {canEdit && onSave && <Tooltip title="Edit tags">
                        <TagStyled style={{fontSize: "1em", cursor: "pointer"}}>
                            <TbEditCircle/>
                        </TagStyled>
                    </Tooltip>}
                </TagEditorPopup>
            </TagsContainerStyled>
        </ContainerStyled>
    )
}

export default React.memo(EditableTags);
