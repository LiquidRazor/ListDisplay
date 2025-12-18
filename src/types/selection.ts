/**
 * Identifier type accepted by selection helpers.
 */
export type RowId = string | number;

/**
 * Available selection modes for the list component.
 */
export type SelectionMode = "none" | "single" | "multiple";

/**
 * Tracks the current selection configuration and the ids that are selected.
 */
export interface SelectionState<TRowId = RowId> {
  /** Current selection mode. */
  mode: SelectionMode;

  /** Identifiers for the selected rows. */
  selectedIds: TRowId[];
}
