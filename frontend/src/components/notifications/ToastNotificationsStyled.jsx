import styled from "styled-components";
import {ToastContainer} from "react-toastify";

const ToastNotificationContainerStyled = styled(ToastContainer)`
    .Toastify__toast--success,
    .Toastify__toast--info,
    .Toastify__toast--warning,
    .Toastify__toast--error {
        color: var(--color-accent);
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
    }

    .Toastify__toast--info {
        color: var(--color-primary);
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
    }

    .Toastify__toast--warning {
        color: var(--color-warning);
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
    }

    .Toastify__toast--error {
        color: var(--color-danger);
        background-color: var(--color-background);
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
    }


    .Toastify__progress-bar--success {
        background-color: var(--color-accent);
    }

    .Toastify__progress-bar--info {
        background-color: var(--color-primary);
    }

    .Toastify__progress-bar--warning {
        background-color: var(--color-warning);
    }

    .Toastify__progress-bar--error {
        background-color: var(--color-danger);
    }


    .Toastify__toast--success .Toastify__toast-icon svg {
        fill: var(--color-accent);
    }

    .Toastify__toast--info .Toastify__toast-icon svg {
        fill: var(--color-primary);
    }

    .Toastify__toast--warning .Toastify__toast-icon svg {
        fill: var(--color-warning);
    }

    .Toastify__toast--error .Toastify__toast-icon svg {
        fill: var(--color-danger);
    }


    .Toastify__toast-body {
        color: var(--color-placeholder);
        font-size: 1.1em;
        align-items: flex-start;
    }


    .Toastify__close-button {
        color: var(--color-text);
    }

    .Toastify__toast--success .Toastify__close-button:hover,
    .Toastify__toast--success .Toastify__close-button:focus {
        color: var(--color-accent);
    }

    .Toastify__toast--info .Toastify__close-button:hover,
    .Toastify__toast--info .Toastify__close-button:focus {
        color: var(--color-primary);
    }

    .Toastify__toast--warning .Toastify__close-button:hover,
    .Toastify__toast--warning .Toastify__close-button:focus {
        color: var(--color-warning);
    }

    .Toastify__toast--error .Toastify__close-button:hover,
    .Toastify__toast--error .Toastify__close-button:focus {
        color: var(--color-danger);
    }
`;

export {ToastNotificationContainerStyled};