// src/core/snapshots.ts
import type { ListState, ListSnapshot, RowId } from "../types";
/**
 * Builds an immutable snapshot of the current list state.
 */
export const buildSnapshot = <
  TRow = any,
  TRowId extends RowId = RowId,
>(
  state: ListState<TRow>
): ListSnapshot<TRow, TRowId> => {
  return {
    rowsAll: [...state.rawRows],
    rowsVisible: [...state.rows],
    filters: { ...state.filters },
    sort: state.sort ? { ...state.sort } : undefined,
    pagination: { ...state.pagination },
    selection: {
      mode: state.selection.mode,
      selectedIds: [...state.selection.selectedIds] as TRowId[],
    },
  };
};
