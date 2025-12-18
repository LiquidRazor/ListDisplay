import type { PaginationState } from "../types";
type AnyRow = any;
/**
 * Recomputes pagination metadata based on the current rows.
 */
export declare const updatePaginationMeta: (pagination: PaginationState, totalItems: number) => PaginationState;
/**
 * Slices the rows according to the pagination state.
 */
export declare const applyPagination: <TRow = AnyRow>(rows: TRow[], pagination: PaginationState) => TRow[];
export {};
//# sourceMappingURL=pagination.d.ts.map