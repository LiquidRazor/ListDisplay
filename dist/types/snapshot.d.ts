import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { RowId, SelectionState } from "./selection";
/**
 * Exported snapshot of the list, meant to be consumed by the parent
 * only on demand (not continuously controlled).
 *
 * @public
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
     * The current row selection state, tracking which rows are selected.
     * {@link SelectionState}
     */
    selection: SelectionState<TRowId>;
}
//# sourceMappingURL=snapshot.d.ts.map