import type { FieldSchema, GeneralAction, ListConfig, ListSnapshot, ListState, RowAction, RowId } from "../types";
/**
 * Contract returned by {@link useListCore}. It aggregates the current list
 * state as well as callbacks to mutate filters, sorting, pagination, and
 * selection. Action-oriented handlers are also exposed to keep the UI layer
 * thin and declarative.
 */
export interface UseListCoreResult<TRow = any, TRowId extends RowId = RowId> {
    /** Latest list state produced by the hook. */
    state: ListState<TRow>;
    /** Field schema definitions used to interpret rows. */
    fields: Array<FieldSchema<TRow>>;
    /** General actions configured for the list. */
    generalActions?: Array<GeneralAction<TRow, TRowId>>;
    /** Row-level actions configured for the list. */
    rowActions?: Array<RowAction<TRow, TRowId>>;
    /** Updates the active filters map. */
    setFilters: (updater: (prev: ListState<TRow>["filters"]) => ListState<TRow>["filters"]) => void;
    /** Sets the active sort descriptor. */
    setSort: (sort: ListState<TRow>["sort"] | undefined) => void;
    /** Moves to the specified page index. */
    setPageIndex: (pageIndex: number) => void;
    /** Updates the number of rows per page. */
    setPageSize: (pageSize: number) => void;
    /** Clears all selections regardless of mode. */
    clearSelection: () => void;
    /** Selects all rows currently visible in the paginated slice. */
    selectAllVisible: () => void;
    /** Triggers the handler for a general action by id. */
    triggerGeneralAction: (actionId: string) => Promise<void>;
    /** Triggers the handler for a row action by id and row index. */
    triggerRowAction: (actionId: string, rowIndex: number) => Promise<void>;
    /** Confirms the currently active action modal. */
    confirmActiveAction: (payload?: unknown) => Promise<void>;
    /** Cancels the currently active action modal. */
    cancelActiveAction: () => void;
    /** Exports the current state into a serializable snapshot. */
    exportState: () => ListSnapshot<TRow, TRowId>;
    /** Refreshes the data source and recomputes derived state. */
    refresh: () => Promise<void>;
}
/**
 * Core hook that encapsulates the data-management logic for ListDisplay. It
 * wires a {@link DataSource}, schema metadata, and optional actions into a
 * cohesive state machine that can be consumed by UI components.
 */
export declare const useListCore: <TRow = any, TRowId extends RowId = RowId>(config: ListConfig<TRow, TRowId>) => UseListCoreResult<TRow, TRowId>;
//# sourceMappingURL=useListCore.d.ts.map