// src/types/listState.ts

import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { SelectionState } from "./selection";
import type { ListStatus, ListUiState } from "./uiState";

/**
 * Full internal state of the list.
 */
export interface ListState<TRow = any> {
  /**
   * Raw rows as maintained from the data source + local mutations.
   */
  rawRows: TRow[];

  /**
   * Rows actually used for rendering after filters/sort/pagination.
   */
  rows: TRow[];

  filters: ActiveFilterState;
  sort?: SortDescriptor<TRow>;
  pagination: PaginationState;
  selection: SelectionState;

  status: ListStatus;
  error?: unknown;

  ui: ListUiState;
}
