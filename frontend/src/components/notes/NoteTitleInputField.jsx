import styled from "styled-components";
import {toast} from "react-toastify";
import {useEffect, useRef} from "react";
import noteValidationSchema from "../../validations/noteValidtion";

const InputWrapperStyled = styled.div`
    position: relative;
    width: 90%;
    margin: 0 auto 2em;

    &::before {
        content: '';
        position: absolute;
        left: 0;
        bottom: -5px;
        width: 100%;
        height: calc(var(--border-width)/1.5);
        background-color: var(--color-accent);
        opacity: 0;
        transform: scaleX(0);
        transition: opacity 1s ease, transform 0.5s;
    }

    &:focus-within::before {
        transition: opacity 0.5s, transform 0.3s ease;
        opacity: 1;
        transform: scaleX(1);
    }
`;

const TitleInputStyled = styled.textarea`
    width: 100%;
    padding: 0.3em;
    height: fit-content;
    resize: none; 
    overflow: hidden;
    position: relative;
    font-size: 2em;
    font-weight: 600;
    color: var(--color-text);
    text-align: center;
    background: transparent;

    &::placeholder {
        color: var(--color-placeholder);
    }

`;

const NoteTitleInputField = ({ title, setTitle }) => {
    const textAreaRef = useRef(null);

    useEffect(() => {
        resizeTextArea();
    }, []);

    const resizeTextArea = () => {
        textAreaRef.current.style.height = 'auto';
        textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    };


    const onTitleChange = (e) => {
        const value = e.target.value;

        try {
            if (value.trim()) noteValidationSchema.title.validateSync(value);
        } catch (error) {
            toast.error(error.message);
            return;
        }

        setTitle(value);
        resizeTextArea();
    };

   return (
        <InputWrapperStyled>
            <TitleInputStyled
                spellCheck={false}
                rows={1}
                ref={textAreaRef}
                value={title}
                onChange={onTitleChange}
                placeholder="📝✨ Title your note!"
            />
        </InputWrapperStyled>
    );
}

export default NoteTitleInputField;

