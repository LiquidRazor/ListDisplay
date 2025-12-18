import type { ActiveFilterState, FieldSchema } from "../types";
type AnyRow = any;
export interface FilterContext<TRow = AnyRow> {
    filters: ActiveFilterState;
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Builds a predicate that evaluates whether a row passes all active filters.
 */
export declare const buildFilterPredicate: <TRow = AnyRow>(ctx: FilterContext<TRow>) => ((row: TRow) => boolean);
/**
 * Applies filters to a list of rows and returns the filtered array.
 */
export declare const applyFilters: <TRow = AnyRow>(rows: TRow[], ctx: FilterContext<TRow>) => TRow[];
export {};
//# sourceMappingURL=filters.d.ts.map