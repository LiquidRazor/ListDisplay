/**
 * Direction used when sorting rows.
 */
export type SortDirection = "asc" | "desc";
/**
 * Describes the active sort configuration for the list.
 */
export interface SortDescriptor<TRow = any> {
    /** Field id used to extract the sortable value from a row. */
    field: keyof TRow & string;
    /** Direction in which rows should be ordered. */
    direction: SortDirection;
}
//# sourceMappingURL=sorting.d.ts.map