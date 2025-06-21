import styled, {css} from "styled-components";
import {motion} from "framer-motion";

const ErrorMessageStyles = styled.div`
    color: var(--color-danger);
    font-size: 0.75rem;
    margin-top: 4px;
    padding: 0 12px;
`;

const AvatarWrapperStyles = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 30px;
    height: 30px;
    font-size: 1em;
    font-weight: 600;
    flex-shrink: 0;
    color: var(--color-placeholder);
    border-radius: 50%;
    border: 0.1em solid var(--color-border);
`;

const WrapperStyles = styled.div`
    position: relative;
    width: 100%;
    max-width: 600px;
    font-size: 0.8rem;
    font-weight: 600;
`;

const InputContainerStyles = styled.div`
    position: relative;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 12px;
    border: 1px solid ${({$hasFocus}) => $hasFocus ? 'var(--color-border)' : ' transparent'};
    border-radius: 8px;
    background: var(--color-background-primary);
    min-height: 50px;
    cursor: text;
    max-height: 100px;
    overflow-x: hidden;
    overflow-y: auto;
    box-shadow: ${({$hasFocus}) => $hasFocus ? '0 1px 2px rgba(25,103,210,0.3)' : 'none'};

    &:hover {
        border-color: var(--color-border);
    }
`;

const InputStyles = styled.input`
    flex-grow: 1;
    min-width: 10%;
    padding: 10px 4px;
    font: inherit;
    color: var(--color-text);
    caret-color: var(--color-text);
`;

const PlaceholderStyles = styled.div`
    color: var(--color-placeholder);
    position: absolute;
    top: 50%;
    opacity: 1;
    padding: 10px 4px;
    transform: translateY(-50%);
    user-select: none;
    animation: PlaceholderEnter 0.3s ease-out;

    @keyframes PlaceholderEnter {
        from {
            opacity: 0;
            width: 0;
        }
        to {
            opacity: 1;
            width: 100%;
        }
    }
`

const CollaboratorBadgeStyles = styled(motion.div)`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    border-radius: 18px;
    padding: 4px 8px 4px 4px;
    color: var(--color-text);
    background: ${({$highlighted}) => $highlighted ? 'var(--background-tertiary)' : 'var(--color-background-secondary)'};
`;

const CollaboratorInfoStyles = styled.div`
    display: flex;
    flex-direction: column;
    font-size: 1em;
`;

const NameStyles = styled.span`
    font-size: 1em;
`;

const EmailStyles = styled.span`
    font-size: 0.8em;
    color: var(--color-placeholder);
`;

const RemoveButtonStyles = styled.button`
    border: none;
    background: none;
    color: var(--color-secondary);
    margin-left: 6px;
    padding: 4px;
    cursor: pointer;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
        background: var(--icon-hover-bg);
        color: var(--color-secondary);
    }

    svg {
        width: 14px;
        height: 14px;
    }
`;

const SuggestionsListStyles = styled(motion.ul)`
    position: absolute;
    width: 100%;
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    margin-top: 8px;
    padding: 8px 0;
    list-style: none;
    z-index: 1000;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    background-color: var(--color-background-primary);
    animation: suggestionEnter 0.2s ease-out;

    @keyframes suggestionEnter {
        from {
            opacity: 0;
            transform: translateY(-8px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const SuggestionItemStyles = styled.li`
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    background: ${props => props.$highlighted ? 'var(--suggestion-highlight)' : 'transparent'};
    transition: all 0.2s;

    &:hover {
        background: var(--suggestion-hover);
    }

    ${props => props.$highlighted && css`
        background: var(--suggestion-highlight) !important;
        color: var(--suggestion-highlight-text);
    `}
`;

const SuggestionContentStyles = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25em;
    flex-grow: 1;
    margin-left: 12px;
`;

export {
    ErrorMessageStyles,
    AvatarWrapperStyles,
    WrapperStyles,
    InputContainerStyles,
    InputStyles,
    PlaceholderStyles,
    CollaboratorBadgeStyles,
    CollaboratorInfoStyles,
    NameStyles,
    EmailStyles,
    RemoveButtonStyles,
    SuggestionsListStyles,
    SuggestionItemStyles,
    SuggestionContentStyles
};
