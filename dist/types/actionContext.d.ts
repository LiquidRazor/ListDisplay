import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { ListSnapshot } from "./snapshot";
import type { SortDescriptor } from "./sorting";
import type { SelectionState } from "./selection";
export interface ActionContextBase<TRow = any, TRowId = string | number> {
    /**
     * All rows managed by the list (after data source + local mutations).
     */
    rows: TRow[];
    /**
     * Rows currently visible in the UI (after filters/sort/pagination).
     */
    visibleRows: TRow[];
    selection: SelectionState<TRowId>;
    filters: ActiveFilterState;
    sort?: SortDescriptor<TRow>;
    pagination: PaginationState;
    /**
     * Primary way for actions to mutate the list.
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;
    /**
     * Export a full snapshot of the current list state.
     */
    exportState: () => ListSnapshot<TRow, TRowId>;
    /**
     * Optional hook to trigger a data source refresh.
     */
    refresh?: () => void | Promise<void>;
}
export interface GeneralActionContext<TRow = any, TRowId = string | number> extends ActionContextBase<TRow, TRowId> {
}
export interface RowActionContext<TRow = any, TRowId = string | number> extends ActionContextBase<TRow, TRowId> {
    row: TRow;
    rowIndex: number;
}
//# sourceMappingURL=actionContext.d.ts.map