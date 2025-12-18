// src/core/selection.ts
import type {RowId, SelectionMode, SelectionState,} from "../types";

type AnyRow = any;

export interface SelectionContext<TRow = AnyRow, TRowId extends RowId = RowId> {
    mode: SelectionMode;
    idKey: keyof TRow & string;
}

/**
 * Initializes a selection state.
 */
export const createSelectionState = (
    mode: SelectionMode = "none"
): SelectionState => ({
    mode,
    selectedIds: [],
});

export const isRowSelected = <TRow = AnyRow, TRowId extends RowId = RowId>(
    row: TRow,
    selection: SelectionState<TRowId>,
    ctx: SelectionContext<TRow, TRowId>
): boolean => {
    const id = (row as any)[ctx.idKey] as TRowId;
    return selection.selectedIds.includes(id);
};

export const toggleRowSelection = <
    TRow = AnyRow,
    TRowId extends RowId = RowId,
>(
    row: TRow,
    selection: SelectionState<TRowId>,
    ctx: SelectionContext<TRow, TRowId>
): SelectionState<TRowId> => {
    const {mode} = ctx;
    const id = (row as any)[ctx.idKey] as TRowId;

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

export const clearSelection = <TRowId extends RowId = RowId>(
    selection: SelectionState<TRowId>
): SelectionState<TRowId> => ({
    ...selection,
    selectedIds: [],
});

export const selectAllVisible = <
    TRow = AnyRow,
    TRowId extends RowId = RowId,
>(
    visibleRows: TRow[],
    selection: SelectionState<TRowId>,
    ctx: SelectionContext<TRow, TRowId>
): SelectionState<TRowId> => {
    if (ctx.mode === "none") {
        return selection;
    }

    const newIds = visibleRows.map(
        (row) => (row as any)[ctx.idKey] as TRowId
    );

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
