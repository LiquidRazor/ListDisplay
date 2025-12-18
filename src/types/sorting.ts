/**
 * Direction used when sorting rows.
 * - `"asc"` - Ascending order (A-Z, 0-9, oldest to newest)
 * - `"desc"` - Descending order (Z-A, 9-0, newest to oldest)
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * Describes the active sort configuration for the list.
 * Specifies which field to sort by and in which direction.
 * @public
 */
export interface SortDescriptor<TRow = any> {
  /**
   * Field id used to extract the sortable value from a row.
   * Must be a valid key of the row type that can be converted to a string.
   */
  field: keyof TRow & string;

  /**
   * Direction in which rows should be ordered.
   * {@link SortDirection}
   */
  direction: SortDirection;
}
