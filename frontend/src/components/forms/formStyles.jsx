import styled from "styled-components";

const FormContainerStyled = styled.div`
    max-width: 375px;
    margin: 0 auto 1em;
    padding: 0 1em;
    background: var(--color-background-primary);
`;

const FormHeaderStyled = styled.h1`
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    color: var(--color-primary);
    margin-bottom: 1.5em;
    user-select: none;
`;

const ErrorMessageStyled = styled.div`
    color: var(--color-danger);
    margin: 1em auto;
    text-align: center;
    font-weight: 600;
    max-width: 100%;
`;

const SubmitButtonStyled = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px 24px;
    margin: 35px auto 15px;
    font-size: 1.1em;
    font-weight: 600;
    color: var(--color-text);
    border: calc(var(--border-width) / 1.5) solid var(--color-border-secondary);
    background-color: var(--color-background-secondary);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
    cursor: pointer;
    transition: 0.3s ease;
    overflow: hidden;

    &:hover:not(:disabled) {
        color: var(--color-background-secondary);
        background-color: var(--color-text);
        border-color: transparent;
    }

    &:active:not(:disabled) {
        scale: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const InputContainerStyled = styled.div`
    margin-bottom: 1.5em;
    position: relative;

    label {
        display: block;
        font-size: 1em;
        font-weight: 600;
        margin-bottom: 0.5em;
        color: var(--color-text);
    }

    .input {
        display: flex;
        align-items: center;
        width: 100%;
        border: var(--border-width) solid var(--color-border-secondary);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        transition: 0.3s ease;
        overflow: hidden;
    }

    .input:has(input:focus),
    .input:hover {
        border-color: ${({has_error}) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
    }

    .input:hover input::placeholder,
    .input:has(input:focus) input::placeholder {
        color: ${({has_error}) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
    }

    input {
        width: 100%;
        color: var(--color-text);
        font-size: 0.9em;
        font-weight: 600;
        transition: 0.3s ease;
    }

    input, .input__icon {
        padding: 0.6em 0.7em;
    }

    input::placeholder {
        opacity: 0.6;
        color: ${({has_error}) => has_error ? "var(--color-danger)" : "var(--color-placeholder)"};
        transition: 0.3s ease;
    }

    .input__icon {
        font-size: 1.2em;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-background-secondary);
        color: ${({has_error}) => has_error ? "var(--color-danger)" : "var(--color-primary)"};
    }

    .input:has(input:focus) .input__icon,
    .input:hover .input__icon {
        color: ${({has_error}) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
    }

    .error {
        color: var(--color-danger);
        font-size: 0.9em;
        font-weight: 600;
        margin-top: 0.5em;
    }
`;

const SensitiveInputStyled = styled.div`
    width: 100%;
    padding-right: 0.5em;
    display: flex;
    align-items: center;
    justify-content: center;

    .eye {
        display: inline-flex;
        color: var(--color-placeholder);
        transition: color 0.3s ease;
        font-size: 1.2em;
        cursor: pointer;

        &:hover {
            color: var(--color-accent);
        }
    }
`;

const LinkStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: 0.4em;
    margin-top: 1em;

    p {
        font-size: 0.9em;
        font-weight: 600;
    }

    a {
        font-size: 1.2em;
        color: var(--color-accent);
        font-weight: 600;
        text-decoration: none;
        cursor: pointer;

        &:hover {
            text-decoration: 0.1em underline;
        }
    }
`;

export {
    FormContainerStyled,
    FormHeaderStyled,
    ErrorMessageStyled,
    SubmitButtonStyled,
    InputContainerStyled,
    SensitiveInputStyled,
    LinkStyled
};
