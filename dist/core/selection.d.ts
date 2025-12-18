import type { RowId, SelectionMode, SelectionState } from "../types";
type AnyRow = any;
/**
 * Configuration context for selection operations, defining how selection behaves and how to identify rows.
 * @internal
 */
export interface SelectionContext<TRow = AnyRow, TRowId extends RowId = RowId> {
    /**
     * The selection mode determining whether no rows, a single row, or multiple rows can be selected.
     */
    mode: SelectionMode;
    /**
     * The property key used to uniquely identify rows.
     */
    idKey: keyof TRow & string;
}
/**
 * Initializes a selection state.
 * @param mode - The selection mode to use; defaults to "none"
 * @returns A new selection state with no rows selected
 * @internal
 */
export declare const createSelectionState: (mode?: SelectionMode) => SelectionState;
/**
 * Checks whether a specific row is currently selected.
 * @param row - The row to check
 * @param selection - The current selection state
 * @param ctx - The selection context containing the ID key
 * @returns True if the row is selected, false otherwise
 * @internal
 */
export declare const isRowSelected: <TRow = AnyRow, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => boolean;
/**
 * Toggles the selection state of a specific row.
 *
 * Behavior varies by selection mode:
 * - "none": Returns unchanged selection state
 * - "single": Selects the row if not selected, deselects if already selected
 * - "multiple": Adds the row to selection if not selected, removes if already selected
 *
 * @param row - The row to toggle selection for
 * @param selection - The current selection state
 * @param ctx - The selection context containing mode and ID key
 * @returns A new selection state with the row's selection toggled
 * @internal
 */
export declare const toggleRowSelection: <TRow = AnyRow, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;
/**
 * Clears all selected rows, returning a selection state with an empty selection.
 * @param selection - The current selection state
 * @returns A new selection state with no rows selected
 * @internal
 */
export declare const clearSelection: <TRowId extends RowId = RowId>(selection: SelectionState<TRowId>) => SelectionState<TRowId>;
/**
 * Selects all visible rows according to the current selection mode.
 *
 * Behavior varies by selection mode:
 * - "none": Returns unchanged selection state
 * - "single": Selects only the first visible row
 * - "multiple": Selects all visible rows
 *
 * @param visibleRows - The array of currently visible rows to select
 * @param selection - The current selection state
 * @param ctx - The selection context containing mode and ID key
 * @returns A new selection state with all visible rows selected (according to mode)
 * @internal
 */
export declare const selectAllVisible: <TRow = AnyRow, TRowId extends RowId = RowId>(visibleRows: TRow[], selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;
export {};
//# sourceMappingURL=selection.d.ts.map