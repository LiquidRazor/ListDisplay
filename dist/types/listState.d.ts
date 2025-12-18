import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { SelectionState } from "./selection";
import type { ListStatus, ListUiState } from "./uiState";
/**
 * Full internal state of the list, containing all data and UI state required for rendering and manipulation.
 * @internal
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
    selection: SelectionState;
    /**
     * The current operational status of the list (idle, loading, error, etc.).
     */
    status: ListStatus;
    /**
     * Error information if the list is in an error state.
     */
    error?: unknown;
    /**
     * UI-specific state such as which filters are visible or expanded.
     * {@link ListUiState}
     */
    ui: ListUiState;
}
//# sourceMappingURL=listState.d.ts.map