export type RowId = string | number;
export type SelectionMode = "none" | "single" | "multiple";
export interface SelectionState<TRowId = RowId> {
    mode: SelectionMode;
    selectedIds: TRowId[];
}
//# sourceMappingURL=selection.d.ts.map