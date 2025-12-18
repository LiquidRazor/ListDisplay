import type { SortDescriptor, FieldSchema } from "../types";
type AnyRow = any;
/**
 * Context object containing sorting configuration and field metadata for list operations.
 *
 * @internal
 */
export interface SortingContext<TRow = AnyRow> {
    /**
     * Optional sort descriptor specifying the field and direction to sort by.
     */
    sort?: SortDescriptor<TRow>;
    /**
     * Array of field schemas defining the structure of rows in the list.
     */
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Applies sorting to a list of rows based on the provided sorting context.
 * Returns a new sorted array without mutating the original.
 *
 * @param rows - Array of rows to sort
 * @param ctx - Sorting context containing sort descriptor and field schemas
 * @returns New array with rows sorted according to the sort descriptor, or original array if no sort is specified
 *
 * @internal
 */
export declare const applySorting: <TRow = AnyRow>(rows: TRow[], ctx: SortingContext<TRow>) => TRow[];
export {};
//# sourceMappingURL=sorting.d.ts.map