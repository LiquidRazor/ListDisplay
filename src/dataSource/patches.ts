// src/dataSource/patches.ts
import type { DataPatch, RowId } from "../types";

/**
 * Extracts the id from a row based on the configured idKey.
 */
export const getRowId = <TRow = any, TRowId extends RowId = RowId>(
    row: TRow,
    idKey: keyof TRow & string
): TRowId => {
    return (row as any)[idKey] as TRowId;
};

/**
 * Applies a single data patch to the current list of rows.
 */
export const applyPatch = <TRow = any, TRowId extends RowId = RowId>(
    rows: TRow[],
    patch: DataPatch<TRow, TRowId>,
    idKey: keyof TRow & string
): TRow[] => {
    switch (patch.type) {
        case "replaceAll":
            return [...patch.rows];

        case "append":
            return [...rows, patch.row];

        case "update": {
            const targetId = getRowId<TRow, TRowId>(patch.row, idKey);
            let changed = false;

            const next = rows.map((row) => {
                const rowId = getRowId<TRow, TRowId>(row, idKey);
                if (rowId === targetId) {
                    changed = true;
                    return patch.row;
                }
                return row;
            });

            return changed ? next : next;
        }

        case "remove": {
            let changed = false;
            const next = rows.filter((row) => {
                const rowId = getRowId<TRow, TRowId>(row, idKey);
                if (rowId === patch.id) {
                    changed = true;
                    return false;
                }
                return true;
            });
            return changed ? next : next;
        }

        default:
            return rows;
    }
};

/**
 * Applies a list of patches in order.
 */
export const applyPatches = <TRow = any, TRowId extends RowId = RowId>(
    rows: TRow[],
    patches: Array<DataPatch<TRow, TRowId>>,
    idKey: keyof TRow & string
): TRow[] => {
    return patches.reduce(
        (current, patch) => applyPatch<TRow, TRowId>(current, patch, idKey),
        rows
    );
};
