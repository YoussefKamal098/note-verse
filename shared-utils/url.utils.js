/**
 * Normalizes the query parameters in a given URL.
 *
 * This function takes a URL string (which may be relative) and returns a normalized URL
 * with its query parameters sorted alphabetically. This ensures that semantically identical
 * URLs generate the same string, which is useful for creating consistent cache keys.
 *
 * @param {string} urlStr - The URL string to normalize.
 * @param {string} [baseUrl] - An optional base URL for parsing relative URLs. If not provided,
 *                             a default of "http://localhost" is used.
 * @returns {string} - The normalized URL (pathname with sorted query parameters).
 * @throws {TypeError} - If the provided urlStr is not a string.
 */
function normalizeUrl(urlStr, baseUrl) {
    if (typeof urlStr !== 'string') {
        throw new TypeError('The urlStr parameter must be a string');
    }

    // Use the provided baseUrl, or fallback to a clean default.
    const effectiveBase = baseUrl || 'http://localhost';

    // Create a URL object. If urlStr is relative, effectiveBase provides the necessary absolute context.
    const urlObj = new URL(urlStr, effectiveBase);

    // Extract query parameters as an array of [key, value] pairs.
    const params = [...urlObj.searchParams.entries()];

    // Sort parameters by key; if keys are equal, sort by value.
    params.sort((a, b) => {
        if (a[0] === b[0]) {
            return a[1].localeCompare(b[1]);
        }
        return a[0].localeCompare(b[0]);
    });

    // Rebuild the query string using the sorted parameters.
    const sortedSearchParams = new URLSearchParams(params);
    // Setting search automatically adds the leading "?" if needed.
    urlObj.search = sortedSearchParams.toString();

    // Return the normalized URL: pathname plus the search string (which already includes "?" if non-empty).
    return urlObj.pathname + urlObj.search;
}

module.exports = {normalizeUrl};
