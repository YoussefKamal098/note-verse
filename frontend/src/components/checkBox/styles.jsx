import styled, {css} from "styled-components";

const CheckboxContainerStyles = styled.label`
    display: inline-flex;
    align-items: center;
    gap: 12px;
    user-select: none;
    transition: all 0.2s ease;
`;

const HiddenInputStyles = styled.input`
    position: absolute;
    opacity: 0;
    height: 0;
    width: 0;
`;

const CheckboxBoxStyles = styled.div`
    position: relative;
    width: 20px;
    height: 20px;
    border: 2px solid ${({$checked, $color}) => $checked ? $color : 'var(--color-border)'};
    border-radius: 6px;
    background: ${({$checked, $color}) => $checked ? $color : 'transparent'};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    cursor: ${({disabled}) => (disabled ? 'not-allowed' : 'pointer')};

    ${({$disabled}) => $disabled && css`
        opacity: 0.6;
        filter: grayscale(0.8);
    `}
    &:hover,
    &:has( ~ label:hover) {
        ${({disabled}) => !disabled && css`
            border-color: var(--color-accent);
        `}
    }

    &:active {
        transform: ${({$disabled}) => !$disabled && 'scale(0.95)'};
    }
`;

const CheckmarkStyles = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(${({$checked}) => $checked ? 1 : 0});
    color: var(--color-background);
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
        stroke-width: 3px;
        transform: scale(${({$checked}) => $checked ? 1 : 0.5});
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    }
`;

const LabelStyles = styled.label`
    font-size: 0.9rem;
    color: var(--color-text);
    opacity: ${({$disabled}) => $disabled ? "0.5" : "1"};
    transition: color 0.2s ease;
    font-weight: 600;
    cursor: ${({disabled}) => (disabled ? 'not-allowed' : 'pointer')};
`;


export {
    CheckboxContainerStyles,
    HiddenInputStyles,
    CheckboxBoxStyles,
    CheckmarkStyles,
    LabelStyles
}