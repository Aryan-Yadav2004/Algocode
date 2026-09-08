/**
 * Cleans an environment URL variable by stripping any surrounding quotes or whitespace.
 * Returns an empty string if the URL is empty or falsy, allowing relative same-domain requests.
 */
export function cleanBaseUrl(url?: string): string {
    if (!url) return '';
    const cleaned = url.replace(/^['"]+|['"]+$/g, '').trim();
    return cleaned;
}
