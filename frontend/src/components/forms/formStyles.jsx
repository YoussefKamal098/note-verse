import styled from "styled-components";

 const FormContainerStyled = styled.div`
    max-width: 425px;
    margin: 2em auto;
    padding: 2.5em 2em;
    background: var(--color-background-primary);
    border: calc(var(--border-width) / 2) solid var(--color-border);
    border-radius: var(--border-radius);
    box-shadow: var(--box-shadow);
`;

 const FormHeaderStyled = styled.h1`
    font-size: 1.8rem;
    font-weight: bold;
    text-align: center;
    color: var(--color-primary);
    margin-bottom: 1.5em;
`;

 const ErrorMessageStyled = styled.div`
    color: var(--color-danger);
    margin: 1em auto;
    text-align: center;
    font-weight: 500;
`;

 const SubmitButtonStyled = styled.button`
    width: 100%;
    padding: 0.5em;
    font-size: 1.1em;
    font-weight: 600;
    color: var(--color-background);
    background-color: var(--color-primary);
    border-radius: calc(var(--border-radius) / 1.5);
    cursor: pointer;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: var(--color-primary-hover);
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
        border: var(--border-width) solid var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        transition: 0.3s ease;
        overflow: hidden;
    }

    .input:has(input:focus),
    .input:hover {
        border-color: ${({ has_error }) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
    }
     
    .input:hover input::placeholder,
    .input:has(input:focus) input::placeholder {
        color: ${({ has_error }) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
    }
     
    input {
        width: 100%;
        font-size: 1em;
        font-weight: 500;
        transition: 0.3s ease;
    }

    input, .input__icon{
         padding: 0.6em 0.7em;
    }
     
    input::placeholder {
        color: ${({ has_error }) => has_error ? "var(--color-danger)" : "var(--color-placeholder)"};
        font-weight: 600;
        transition: 0.3s ease;
    }
     
    .input__icon {
        font-size: 1.2em;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--color-background-secondary);
        color: ${({ has_error }) => has_error ? "var(--color-danger)" : "var(--color-primary)"};
    }

     .input:has(input:focus) .input__icon,
     .input:hover .input__icon{
         color:  ${({ has_error }) => has_error ? "var(--color-danger)" : "var(--color-accent)"};
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
        font-size: 1em;
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
