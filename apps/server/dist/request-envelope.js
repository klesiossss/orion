/** Validates the small RPC envelope before the method-specific schema runs. */
export function parseRequestEnvelope(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const envelope = value;
    if (typeof envelope['id'] !== 'string' ||
        typeof envelope['method'] !== 'string' ||
        !('params' in envelope)) {
        return undefined;
    }
    return { id: envelope['id'], method: envelope['method'], params: envelope['params'] };
}
/** Fast success path for terminal traffic; invalid data falls back to the full schema. */
export function parseFrequentMethodParams(method, value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const params = value;
    const terminalId = params['terminalId'];
    if (typeof terminalId !== 'string' || terminalId.length === 0)
        return undefined;
    if (method === 'terminal.input') {
        const data = params['data'];
        if (typeof data !== 'string' || data.length > 65_536)
            return undefined;
        return { terminalId, data };
    }
    const columns = params['columns'];
    const rows = params['rows'];
    if (!validTerminalDimension(columns) || !validTerminalDimension(rows))
        return undefined;
    return { terminalId, columns, rows };
}
function validTerminalDimension(value) {
    return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 1_000;
}
//# sourceMappingURL=request-envelope.js.map