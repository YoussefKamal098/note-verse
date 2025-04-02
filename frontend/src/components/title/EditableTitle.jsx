import React, {useRef, useState} from "react";
import styled from "styled-components";
import {LuPencilLine} from "react-icons/lu";
import Tooltip from "../tooltip/Tooltip";
import TitleInput from "./TitleInput";
import TitleEditorPopup from "./TitleEditorPopup";

const EditButtonStyled = styled(LuPencilLine)`
    position: absolute;
    cursor: pointer;
    color: var(--color-text);
    transition: all 0.3s ease;
    opacity: 0;
    pointer-events: none;
    font-size: 1.5em;
    transform: translate(-50%, -50%);
    z-index: 2;

    &:hover {
        color: var(--color-accent);
        transform: translate(-50%, -50%) scale(1.1);
    }
`;


const EditableTitle = ({title, onSave = (title) => ({title})}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [editBtnRect, setEditBtnRect] = useState({});
    const wrapperRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!wrapperRef.current) return;
        setIsHovering(true);

        const rect = wrapperRef.current.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setEditBtnRect({
            x: Math.max(20, Math.min(rect.width - 20, x)),
            y: Math.max(20, Math.min(rect.height - 20, y)),
            top: e.clientY,
            left: e.clientX,
            width: e.width,
            height: e.height
        });
    };

    return (
        <div
            style={{
                position: "relative",
                margin: "0 auto 2em"
            }}
            ref={wrapperRef}
            onPointerEnter={() => setIsHovering(true)}
            onPointerLeave={() => setIsHovering(false)}
            onPointerMove={handleMouseMove}
        >
            <TitleInput title={title} disabled={true}/>

            <TitleEditorPopup
                title={title}
                onSave={onSave}
            >
                <Tooltip title={"Edit Title"} targetRect={editBtnRect}>
                    <EditButtonStyled
                        style={{
                            left: `${editBtnRect.x}px`,
                            top: `${editBtnRect.y}px`,
                            opacity: isHovering ? 1 : 0,
                            pointerEvents: isHovering ? 'auto' : 'none'
                        }}
                    />
                </Tooltip>
            </TitleEditorPopup>
        </div>
    );
};

export default React.memo(EditableTitle);
