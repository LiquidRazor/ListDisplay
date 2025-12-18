/**
 * Initializes a selection state.
 * @param mode - The selection mode to use; defaults to "none"
 * @returns A new selection state with no rows selected
 * @internal
 */
export const createSelectionState = (mode = "none") => ({
    mode,
    selectedIds: [],
});
/**
 * Checks whether a specific row is currently selected.
 * @param row - The row to check
 * @param selection - The current selection state
 * @param ctx - The selection context containing the ID key
 * @returns True if the row is selected, false otherwise
 * @internal
 */
export const isRowSelected = (row, selection, ctx) => {
    const id = row[ctx.idKey];
    return selection.selectedIds.includes(id);
};
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
/**
 * Clears all selected rows, returning a selection state with an empty selection.
 * @param selection - The current selection state
 * @returns A new selection state with no rows selected
 * @internal
 */
export const clearSelection = (selection) => ({
    ...selection,
    selectedIds: [],
});
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
//# sourceMappingURL=selection.js.map