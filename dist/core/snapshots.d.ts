import type { ListState, ListSnapshot, RowId } from "../types";
/**
 * Builds an immutable snapshot of the current list state.
 */
export declare const buildSnapshot: <TRow = any, TRowId extends RowId = RowId>(state: ListState<TRow>) => ListSnapshot<TRow, TRowId>;
//# sourceMappingURL=snapshots.d.ts.map