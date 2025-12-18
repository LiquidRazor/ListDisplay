import type { PaginationState } from "../types";
type AnyRow = any;
/**
 * Recomputes pagination metadata based on the current rows.
 *
 * Ensures that page indices remain valid and recalculates total pages
 * when the row count or page size changes.
 *
 * @param pagination - The current pagination state
 * @param totalItems - The total number of items in the dataset
 * @returns Updated pagination state with corrected indices and metadata
 *
 * @internal
 */
export declare const updatePaginationMeta: (pagination: PaginationState, totalItems: number) => PaginationState;
/**
 * Slices the rows according to the pagination state.
 *
 * Extracts the subset of rows that should be displayed on the current page.
 * If pageSize is 0 or negative, returns all rows without pagination.
 *
 * @typeParam TRow - The type of row objects in the array
 * @param rows - The complete array of rows to paginate
 * @param pagination - The pagination state containing page index and size
 * @returns A slice of rows for the current page
 *
 * @internal
 */
export declare const applyPagination: <TRow = AnyRow>(rows: TRow[], pagination: PaginationState) => TRow[];
export {};
//# sourceMappingURL=pagination.d.ts.map