/** Identify the checkout, not the shared Git object directory of its worktrees. */
export declare function canonicalCheckoutRoot(directory: string): string;
/** Turns may share a checkout; replacing files requires exclusive access. */
export declare class CheckoutAccess {
    #private;
    beginTurn(directory: string, owner: string): void;
    /** Transfer an in-flight start's guard to the process that still must stop. */
    retainStopping(directory: string, owner: string): void;
    endTurn(owner: string): void;
    exclusive<T>(directory: string, operation: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=checkout-access.d.ts.map