import type { RowId, SelectionMode, SelectionState } from "../types";
type AnyRow = any;
export interface SelectionContext<TRow = AnyRow, TRowId extends RowId = RowId> {
    mode: SelectionMode;
    idKey: keyof TRow & string;
}
/**
 * Initializes a selection state.
 */
export declare const createSelectionState: (mode?: SelectionMode) => SelectionState;
export declare const isRowSelected: <TRow = AnyRow, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => boolean;
export declare const toggleRowSelection: <TRow = AnyRow, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;
export declare const clearSelection: <TRowId extends RowId = RowId>(selection: SelectionState<TRowId>) => SelectionState<TRowId>;
export declare const selectAllVisible: <TRow = AnyRow, TRowId extends RowId = RowId>(visibleRows: TRow[], selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;
export {};
//# sourceMappingURL=selection.d.ts.map