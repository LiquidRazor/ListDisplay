/**
 * Identifier type accepted by selection helpers. Can be either a string or numeric value used to uniquely identify rows.
 * @public
 */
export type RowId = string | number;

/**
 * Available selection modes for the list component.
 * - `"none"`: No row selection allowed
 * - `"single"`: Only one row can be selected at a time
 * - `"multiple"`: Multiple rows can be selected simultaneously
 * @public
 */
export type SelectionMode = "none" | "single" | "multiple";

/**
 * Tracks the current selection configuration and the ids that are selected.
 * @public
 */
export interface SelectionState<TRowId = RowId> {
  /**
   * Current selection mode determining how rows can be selected.
   * {@link SelectionMode}
   */
  mode: SelectionMode;

  /**
   * Array of identifiers for the currently selected rows.
   */
  selectedIds: TRowId[];
}
