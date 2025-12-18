import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { ListSnapshot } from "./snapshot";
import type { SortDescriptor } from "./sorting";
import type { SelectionState } from "./selection";


/**
 * Base context object provided to all action handlers, containing the current list state and mutation methods.
 *
 * @public
 */
export interface ActionContextBase<TRow = any, TRowId = string | number> {
  /**
   * All rows managed by the list (after data source + local mutations).
   */
  rows: TRow[];

  /**
   * Rows currently visible in the UI (after filters/sort/pagination).
   */
  visibleRows: TRow[];

  /**
   * The current row selection state, tracking which rows are selected.
   * {@link SelectionState}
   */
  selection: SelectionState<TRowId>;

  /**
   * The current active filter state, containing all applied filters.
   * {@link ActiveFilterState}
   */
  filters: ActiveFilterState;

  /**
   * The current sort configuration, if any sorting is applied.
   * {@link SortDescriptor}
   */
  sort?: SortDescriptor<TRow>;

  /**
   * The current pagination state, including page size and current page.
   * {@link PaginationState}
   */
  pagination: PaginationState;

  /**
   * Primary way for actions to mutate the list. Pass an updater function that receives the current rows and returns the new rows array.
   */
  updateRows: (updater: (current: TRow[]) => TRow[]) => void;

  /**
   * Export a full snapshot of the current list state.
   * {@link ListSnapshot}
   */
  exportState: () => ListSnapshot<TRow, TRowId>;

  /**
   * Optional hook to trigger a data source refresh.
   */
  refresh?: () => void | Promise<void>;
}

/**
 * Context object provided to general action handlers that are not tied to a specific row.
 * {@link ActionContextBase}
 * @public
 */
export interface GeneralActionContext<TRow = any, TRowId = string | number>
  extends ActionContextBase<TRow, TRowId> {}

/**
 * Context object provided to row-specific action handlers, including the specific row being operated on.
 * {@link ActionContextBase}
 * @public
 */
export interface RowActionContext<TRow = any, TRowId = string | number>
    extends ActionContextBase<TRow, TRowId> {
  /**
   * The specific row this action is operating on.
   */
  row: TRow;

  /**
   * The index of this row in the rows array.
   */
  rowIndex: number;
}
