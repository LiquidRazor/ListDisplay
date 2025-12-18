import type { SortDescriptor, FieldSchema } from "../types";
type AnyRow = any;
export interface SortingContext<TRow = AnyRow> {
    sort?: SortDescriptor<TRow>;
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Applies sorting to a list of rows.
 */
export declare const applySorting: <TRow = AnyRow>(rows: TRow[], ctx: SortingContext<TRow>) => TRow[];
export {};
//# sourceMappingURL=sorting.d.ts.map