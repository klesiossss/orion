/**
 * A placeholder for a tool result part that carries an image, audio clip or
 * file inline as base64. Written into an item's text, a single screenshot
 * added megabytes to every history load and rendered as unreadable noise.
 */
export function binaryPlaceholder(value) {
    if (!isRecord(value))
        return undefined;
    const type = typeof value.type === 'string' ? value.type.toLowerCase() : '';
    const inline = typeof value.data === 'string' ||
        [value.image_url, value.imageUrl, value.url].some((url) => typeof url === 'string' && url.startsWith('data:'));
    if (inline && type.includes('image'))
        return '[image]';
    if (inline && type.includes('audio'))
        return '[audio]';
    const resource = value.resource;
    if (type === 'resource' && isRecord(resource) && typeof resource.blob === 'string')
        return typeof resource.uri === 'string' ? `[file ${resource.uri}]` : '[file]';
    return undefined;
}
/** JSON for a reader, with inline binary parts replaced by their placeholders. */
export function jsonWithoutBinary(value, indent) {
    return (binaryPlaceholder(value) ??
        JSON.stringify(value, (_key, nested) => binaryPlaceholder(nested) ?? nested, indent));
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
//# sourceMappingURL=binary-content.js.map