const DECISION_TO_KIND = {
    approve: 'allow_once',
    'approve-session': 'allow_always',
    deny: 'reject_once',
    abort: 'reject_once',
};
export function optionFor(options, decision) {
    const wanted = DECISION_TO_KIND[decision];
    const exact = options.find((option) => option.kind === wanted);
    if (exact?.optionId)
        return exact.optionId;
    // A session grant may be narrowed to one use, never the other way round.
    if (decision === 'approve-session') {
        return options.find((option) => option.kind === 'allow_once' && option.optionId)?.optionId;
    }
    return undefined;
}
//# sourceMappingURL=approvals.js.map