const useFormNavigation = (fieldRefs) => {
    const handleKeyDown = (event, isSubmitting) => {
        const index = fieldRefs.findIndex(ref => ref.current === document.activeElement);

        if (event.key === "ArrowDown" && index < fieldRefs.length - 1) {
            // Move focus to the next field
            fieldRefs[index + 1]?.current?.focus();
        } else if (event.key === "ArrowUp" && index > 0) {
            // Move focus to the previous field
            fieldRefs[index - 1]?.current?.focus();
        } else if (event.key === "Enter" && index < fieldRefs.length - 1) {
            // Prevent form submission and move to the next field
            event.preventDefault();
            fieldRefs[index + 1]?.current?.focus();
        } else if (event.key === "Enter" && index === fieldRefs.length - 1 && !isSubmitting) {
            // Prevent form submission and move to the next field
            event.preventDefault(); // Prevent default submit action
            event.target.closest('form').requestSubmit(); // Manually trigger form submission
        }
    };

    return {handleKeyDown};
};

export default useFormNavigation;
