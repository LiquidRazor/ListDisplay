/**
 * Builds an immutable snapshot of the current list state.
 *
 * This function creates a deep copy of all state properties to ensure the snapshot
 * is immutable and safe to store or compare against future states.
 *
 * @typeParam TRow - The type of row data managed by the list. Defaults to `any`.
 * @typeParam TRowId - The type used for row identifiers. Must extend {@link RowId}. Defaults to `RowId`.
 *
 * @param state - The current list state to snapshot. {@link ListState}
 * @returns An immutable snapshot containing copies of all state data. {@link ListSnapshot}
 *
 * @internal
 */
export const buildSnapshot = (state) => {
    return {
        rowsAll: [...state.rawRows],
        rowsVisible: [...state.rows],
        filters: { ...state.filters },
        sort: state.sort ? { ...state.sort } : undefined,
        pagination: { ...state.pagination },
        selection: {
            mode: state.selection.mode,
            selectedIds: [...state.selection.selectedIds],
        },
    };
};
//# sourceMappingURL=snapshots.js.map