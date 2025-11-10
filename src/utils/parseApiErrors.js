export function parseApiErrors(errorResponse) {
    if (!errorResponse || typeof errorResponse !== "object") return [];

    const messages = [];

    Object.entries(errorResponse).forEach(([field, value]) => {
        if (Array.isArray(value)) {
            value.forEach((msg) => messages.push(msg));
        } else if (typeof value === "string") {
            messages.push(value);
        } else if (typeof value === "object" && value !== null) {
            messages.push(...parseApiErrors(value));
        }
    });

    return messages;
}
