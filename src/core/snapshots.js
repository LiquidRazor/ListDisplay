/**
 * Builds an immutable snapshot of the current list state.
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
