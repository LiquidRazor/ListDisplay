import type { ListState, ListSnapshot, RowId } from "../types";
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
export declare const buildSnapshot: <TRow = any, TRowId extends RowId = RowId>(state: ListState<TRow>) => ListSnapshot<TRow, TRowId>;
//# sourceMappingURL=snapshots.d.ts.map