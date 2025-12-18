/**
 * Initializes a selection state.
 */
export const createSelectionState = (mode = "none") => ({
    mode,
    selectedIds: [],
});
export const isRowSelected = (row, selection, ctx) => {
    const id = row[ctx.idKey];
    return selection.selectedIds.includes(id);
};
export const toggleRowSelection = (row, selection, ctx) => {
    const { mode } = ctx;
    const id = row[ctx.idKey];
    if (mode === "none") {
        return selection;
    }
    if (mode === "single") {
        const isSelected = selection.selectedIds.includes(id);
        return {
            ...selection,
            selectedIds: isSelected ? [] : [id],
        };
    }
    // multiple
    const exists = selection.selectedIds.includes(id);
    if (exists) {
        return {
            ...selection,
            selectedIds: selection.selectedIds.filter((x) => x !== id),
        };
    }
    return {
        ...selection,
        selectedIds: [...selection.selectedIds, id],
    };
};
export const clearSelection = (selection) => ({
    ...selection,
    selectedIds: [],
});
export const selectAllVisible = (visibleRows, selection, ctx) => {
    if (ctx.mode === "none") {
        return selection;
    }
    const newIds = visibleRows.map((row) => row[ctx.idKey]);
    if (ctx.mode === "single") {
        return {
            ...selection,
            selectedIds: newIds.length > 0 ? [newIds[0]] : [],
        };
    }
    // multiple
    return {
        ...selection,
        selectedIds: newIds,
    };
};
