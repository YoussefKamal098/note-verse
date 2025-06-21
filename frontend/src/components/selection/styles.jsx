import styled, {css} from "styled-components";
import {TiArrowSortedUp} from "react-icons/ti";
import {Check} from "react-feather";

const sharedTransitionStyles = css`
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
`;

const sharedGridDisplayStyles = css`
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 1fr auto;
    justify-content: space-between;
    align-items: center;
`

const sharedTextOverflowStyles = css`
    text-overflow: ellipsis;
    white-space: nowrap;
    text-wrap: nowrap;
    overflow: hidden;
`

const SelectContainerStyles = styled.div`
    position: relative;
    width: 100%;
    max-width: 150px;
`;

const SelectButtonStyles = styled.button`
    width: 100%;
    ${sharedGridDisplayStyles};
    align-items: center;
    padding: 8px 10px;
    background: var(--color-background-primary);
    //border: 2px solid var(--color-border-secondary);
    border-radius: 10px;
    //box-shadow: var(--box-shadow-hoverable);
    cursor: pointer;
    ${sharedTransitionStyles};
    color: var(--color-text);

    &:hover,
    &:focus-visible,
    &[aria-expanded="true"] {
        background: var(--color-background-secondary);
    }

    &[aria-expanded="true"] {
        box-shadow: var(--box-shadow);
    }
`;

const SelectedValueStyles = styled.span`
    ${sharedTextOverflowStyles};
    font-size: 0.9em;
    font-weight: 600;
    text-align: left;
`;

const ChevronIconStyles = styled(TiArrowSortedUp)`
    color: var(--color-secondary);
    transition: transform 0.2s ease;
    ${({$isOpen}) => $isOpen && css`
        transform: rotate(180deg);
    `}
`;

const OptionsListStyles = styled.ul`
    position: fixed;
    top: ${({$containerTop, $containerHeight}) => `${$containerTop + $containerHeight}px`};
    left: ${({$containerLeft}) => `${$containerLeft}px`};
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 150px;
    max-height: 200px;
    overflow-x: hidden;
    overflow-y: auto;
    margin-top: 8px;
    padding: 8px;
    background: var(--color-background);
    border-radius: 5px;
    box-shadow: var(--box-shadow-hoverable);
    opacity: ${({$isOpen}) => $isOpen ? 1 : 0};
    transform: ${({$isOpen}) => $isOpen
            ? 'scale(1) translateY(0)'
            : 'scale(0.95) translateY(-8px)'
    };
    visibility: ${({$isOpen}) => $isOpen ? 'visible' : 'hidden'};
    ${sharedTransitionStyles};
    z-index: 10;
    transform-origin: top left;
    scroll-behavior: smooth;
`;

const OptionTextStyles = styled.div`
    ${sharedTextOverflowStyles};
`

const CheckMarkStyles = styled(Check)`
    color: var(--color-primary);
`;

const OptionStyles = styled.li`
    position: relative;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: 0.75em;
    padding: 8px 10px;
    font-size: 0.75em;
    font-weight: 600;
    color: var(--color-text);
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.1s ease;
    transform-origin: center;

    ${({$isFirstAction}) => $isFirstAction && css`
        &::after {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            top: -10px;
            content: '';
            width: calc(100% - 10px);
            height: 1px;
            background-color: var(--color-border);
        }

        margin-top: 10px;
    `}
    ${({$isHighlighted}) => $isHighlighted && css`
        background: var(--color-background-secondary) !important;
    `}
    ${({$isSelected}) => $isSelected && css`
        background: var(--color-background-primary);
        color: var(--color-primary);
    `}
    ${({$isAction}) => $isAction && css`
        color: var(--color-secondary);

        &:hover {
            color: var(--color-secondary-hover);
        }
    `}
    &:hover {
        background: var(--color-background-primary);
        transform: scale(1.02);
    }

    &:active {
        transform: scale(0.98);
    }
`;

export {
    SelectButtonStyles,
    SelectContainerStyles,
    SelectedValueStyles,
    ChevronIconStyles,
    OptionsListStyles,
    OptionTextStyles,
    CheckMarkStyles,
    OptionStyles,
}
