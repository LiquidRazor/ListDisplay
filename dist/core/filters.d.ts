/**
 * Core filtering module providing predicate building and filter application for list data.
 *
 * @packageDocumentation
 * @internal
 */
import type { ActiveFilterState, FieldSchema } from "../types";
/**
 * Type alias for any row object.
 * @internal
 */
type AnyRow = any;
/**
 * Context object containing filter state and field schemas needed for filter evaluation.
 *
 * @typeParam TRow - The type of row objects being filtered
 * @internal
 */
export interface FilterContext<TRow = AnyRow> {
    /**
     * The current active filter state containing all applied filters.
     */
    filters: ActiveFilterState;
    /**
     * Array of field schemas that define the structure and filter configuration for each field.
     */
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Builds a predicate function that evaluates whether a row passes all active filters.
 * The predicate performs AND logic across all filters (row must match all filters).
 * Returns a no-op predicate if no filters are active.
 *
 * @typeParam TRow - The type of row objects
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A predicate function that returns true if the row passes all filters
 * @internal
 */
export declare const buildFilterPredicate: <TRow = AnyRow>(ctx: FilterContext<TRow>) => ((row: TRow) => boolean);
/**
 * Applies all active filters to a list of rows and returns the filtered array.
 * This is the primary entry point for filter evaluation.
 *
 * @typeParam TRow - The type of row objects
 * @param rows - The array of rows to filter
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A new array containing only rows that pass all filters
 * @internal
 */
export declare const applyFilters: <TRow = AnyRow>(rows: TRow[], ctx: FilterContext<TRow>) => TRow[];
export {};
//# sourceMappingURL=filters.d.ts.map