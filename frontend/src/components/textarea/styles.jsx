import styled from "styled-components";

const TextAreaStyles = styled.textarea`
    width: 100%;
    font-size: 0.8rem;
    font-weight: 600;
    line-height: 1.25rem;
    color: var(--color-text);
    resize: ${props => props.$resize ? props.$resize : "none"};
`;

const LabelContainerStyles = styled.div`
    position: relative;
    padding: 10px;
    width: 100%;
    min-width: 50px;
    max-width: 600px;
    margin-top: 30px;
    border: 2px solid ${({$hasFocus}) => $hasFocus ? 'var(--color-border)' : ' transparent'};
    border-radius: 8px;
    background: var(--color-background-primary);
    box-shadow: ${({$hasFocus}) => $hasFocus ? '0 1px 2px rgba(25,103,210,0.3)' : 'none'};

    &:hover {
        border-color: var(--color-border);
    }
`;

const ErrorMessageStyles = styled.div`
    width: 100%;
    overflow: hidden;
    color: var(--color-danger);
    font-size: 0.8rem;
    font-weight: 600;
`;

const CharacterCounterStyles = styled.div`
    font-size: 0.75rem;
    color: ${({$isExceeded}) => $isExceeded ? 'var(--color-danger)' : 'var(--color-primary)'};
    margin-left: auto;
    font-weight: 600;
`;

const FloatingLabelStyles = styled.span`
    position: absolute;
    top: ${props => props.$focused ? '-1.5rem' : '10px'};
    left: ${props => props.$focused ? '0' : '10px'};
    border-radius: 4px;
    font-size: ${props => props.$focused ? '0.85rem' : '0.8rem'};
    color: ${props => props.$focused ? 'var(--color-primary)' : 'var(--color-placeholder)'};
    background: ${props => props.$focused ? 'var(--color-background-primary)' : 'transparent'};
    padding: 0 4px;
    font-weight: bold;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    pointer-events: none;
`;

const FooterStyles = styled.div`
    width: 100%;
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    margin-top: 10px;
    gap: 20px;
`

export {
    TextAreaStyles,
    LabelContainerStyles,
    FloatingLabelStyles,
    ErrorMessageStyles,
    CharacterCounterStyles,
    FooterStyles
}
