export const getColorForUser = (id, lastname, firstname) => {
    // Generate unique hash based on all inputs
    const inputString = `${firstname}:${lastname}:${id}`;
    let hash = 0;

    for (let i = 0; i < inputString.length; i++) {
        hash = inputString.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to a 6-digit hex color
    const color = Math.abs(hash) % 0xFFFFFF; // Ensure it's within 0-FFFFFF range
    return `#${color.toString(16).padStart(6, '0')}`; // Pad with zeros to ensure 6 digits
};