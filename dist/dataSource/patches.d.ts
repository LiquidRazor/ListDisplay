import type { DataPatch, RowId } from "../types";
/**
 * Extracts the id from a row based on the configured idKey.
 */
export declare const getRowId: <TRow = any, TRowId extends RowId = RowId>(row: TRow, idKey: keyof TRow & string) => TRowId;
/**
 * Applies a single data patch to the current list of rows.
 */
export declare const applyPatch: <TRow = any, TRowId extends RowId = RowId>(rows: TRow[], patch: DataPatch<TRow, TRowId>, idKey: keyof TRow & string) => TRow[];
/**
 * Applies a list of patches in order.
 */
export declare const applyPatches: <TRow = any, TRowId extends RowId = RowId>(rows: TRow[], patches: Array<DataPatch<TRow, TRowId>>, idKey: keyof TRow & string) => TRow[];
//# sourceMappingURL=patches.d.ts.map