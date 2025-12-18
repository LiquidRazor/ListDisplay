import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { RowId, SelectionState } from "./selection";

/**
 * Exported snapshot of the list, meant to be consumed by the parent
 * only on demand (not continuously controlled).
 */
export interface ListSnapshot<TRow = any, TRowId = RowId> {
  /**
   * All rows currently known by the list (after data source + local mutations).
   */
  rowsAll: TRow[];

  /**
   * Rows currently visible (after filters, sort, pagination).
   */
  rowsVisible: TRow[];

  filters: ActiveFilterState;
  sort?: SortDescriptor<TRow>;
  pagination: PaginationState;
  selection: SelectionState<TRowId>;
}
