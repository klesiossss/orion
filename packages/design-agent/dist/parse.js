function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
export function record(value, field) {
    if (!isRecord(value))
        throw new Error(`${field} must be an object`);
    return value;
}
export function optionalRecord(value) {
    return isRecord(value) ? value : undefined;
}
export function string(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${field} must be a non-empty string`);
    }
    return value;
}
export function optionalString(value, field) {
    if (value === undefined)
        return undefined;
    return string(value, field);
}
export function strings(value, field) {
    if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string' && entry.trim())) {
        throw new Error(`${field} must be a string array`);
    }
    return value;
}
export function stringsAllowEmpty(value, field) {
    if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
        throw new Error(`${field} must be a string array`);
    }
    return value;
}
export function list(value, field) {
    if (!Array.isArray(value))
        throw new Error(`${field} must be an array`);
    return value;
}
export function array(value, field) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${field} must be a non-empty array`);
    }
    return value;
}
export function integer(value, field, minimum, maximum) {
    const parsed = boundedInteger(value, minimum, maximum);
    if (parsed === undefined) {
        throw new Error(`${field} must be an integer from ${minimum} to ${maximum}`);
    }
    return parsed;
}
export function boundedInteger(value, minimum, maximum) {
    return typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= minimum &&
        value <= maximum
        ? value
        : undefined;
}
export function fontWeights(value, field) {
    if (!Array.isArray(value) || value.length === 0) {
        throw new Error(`${field} must contain font weights between 1 and 1000`);
    }
    const weights = value.map((entry) => typeof entry === 'string' && /^\d{1,4}$/u.test(entry) ? Number(entry) : entry);
    if (!weights.every((weight) => typeof weight === 'number' && Number.isInteger(weight) && weight >= 1 && weight <= 1_000)) {
        throw new Error(`${field} must contain font weights between 1 and 1000`);
    }
    return weights;
}
export function member(value, values, field) {
    if (typeof value !== 'string' || !isMember(value, values)) {
        throw new Error(`${field} must be one of ${values.join(', ')}`);
    }
    return value;
}
function isMember(value, values) {
    return values.some((candidate) => candidate === value);
}
//# sourceMappingURL=parse.js.map