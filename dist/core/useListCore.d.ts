/**
 * Core hook module that encapsulates the data-management logic for ListDisplay.
 * This module provides the main `useListCore` hook which wires a data source,
 * schema metadata, and optional actions into a cohesive state machine that can
 * be consumed by UI components.
 *
 * @internal
 */
import type { FieldSchema, GeneralAction, ListConfig, ListSnapshot, ListState, RowAction, RowId } from "../types";
/**
 * Contract returned by {@link useListCore}. It aggregates the current list
 * state as well as callbacks to mutate filters, sorting, pagination, and
 * selection. Action-oriented handlers are also exposed to keep the UI layer
 * thin and declarative.
 *
 * @typeParam TRow - The type of row data managed by the list.
 * @typeParam TRowId - The type of the unique identifier for each row.
 *
 * @internal
 */
export interface UseListCoreResult<TRow = any, TRowId extends RowId = RowId> {
    /**
     * Latest list state produced by the hook.
     * Contains all rows, visible rows, filters, sorting, pagination, selection, and UI state.
     */
    state: ListState<TRow>;
    /**
     * Field schema definitions used to interpret rows.
     * Defines how each field should be rendered, filtered, and sorted.
     */
    fields: Array<FieldSchema<TRow>>;
    /**
     * General actions configured for the list.
     * These actions operate on the entire list or selected rows.
     */
    generalActions?: Array<GeneralAction<TRow, TRowId>>;
    /**
     * Row-level actions configured for the list.
     * These actions operate on individual rows.
     */
    rowActions?: Array<RowAction<TRow, TRowId>>;
    /**
     * Updates the active filters map.
     * Accepts an updater function that receives the previous filters and returns the new filters.
     * Triggers a recomputation of derived state including filtering, sorting, and pagination.
     *
     * @param updater - Function that receives the previous filters and returns the new filters.
     */
    setFilters: (updater: (prev: ListState<TRow>["filters"]) => ListState<TRow>["filters"]) => void;
    /**
     * Sets the active sort descriptor.
     * Triggers a recomputation of derived state including sorting and pagination.
     *
     * @param sort - The new sort descriptor or undefined to clear sorting.
     */
    setSort: (sort: ListState<TRow>["sort"] | undefined) => void;
    /**
     * Moves to the specified page index.
     * Triggers a recomputation of the visible rows based on the new page.
     *
     * @param pageIndex - Zero-based index of the page to navigate to.
     */
    setPageIndex: (pageIndex: number) => void;
    /**
     * Updates the number of rows per page.
     * Resets to the first page and triggers a recomputation of pagination metadata.
     *
     * @param pageSize - The new number of rows to display per page.
     */
    setPageSize: (pageSize: number) => void;
    /**
     * Clears all selections regardless of mode.
     * Resets the selection state to its initial empty state.
     */
    clearSelection: () => void;
    /**
     * Selects all rows currently visible in the paginated slice.
     * Only operates on the current page of visible rows.
     */
    selectAllVisible: () => void;
    /**
     * Triggers the handler for a general action by id.
     * If the action opens a modal, opens the modal instead of executing the handler immediately.
     *
     * @param actionId - The unique identifier of the general action to trigger.
     * @returns A promise that resolves when the action handler completes.
     */
    triggerGeneralAction: (actionId: string) => Promise<void>;
    /**
     * Triggers the handler for a row action by id and row index.
     * If the action opens a modal, opens the modal instead of executing the handler immediately.
     *
     * @param actionId - The unique identifier of the row action to trigger.
     * @param rowIndex - The index of the row in the visible rows array.
     * @returns A promise that resolves when the action handler completes.
     */
    triggerRowAction: (actionId: string, rowIndex: number) => Promise<void>;
    /**
     * Confirms the currently active action modal.
     * Executes the associated action handler and closes the modal.
     *
     * @param payload - Optional payload data from the modal to pass to the action handler.
     * @returns A promise that resolves when the action handler completes.
     */
    confirmActiveAction: (payload?: unknown) => Promise<void>;
    /**
     * Cancels the currently active action modal.
     * Closes the modal and clears the active action state without executing the handler.
     */
    cancelActiveAction: () => void;
    /**
     * Exports the current state into a serializable snapshot.
     * Useful for debugging, state persistence, or external integrations.
     *
     * @returns A complete snapshot of the current list state.
     */
    exportState: () => ListSnapshot<TRow, TRowId>;
    /**
     * Refreshes the data source and recomputes derived state.
     * Re-invokes the data source init method and updates all derived state.
     *
     * @returns A promise that resolves when the refresh completes.
     */
    refresh: () => Promise<void>;
}
/**
 * Core hook that encapsulates the data-management logic for ListDisplay. It
 * wires a {@link DataSource}, schema metadata, and optional actions into a
 * cohesive state machine that can be consumed by UI components.
 *
 * This hook manages:
 * - Data loading from the data source
 * - Real-time updates via data source subscriptions
 * - Filtering, sorting, and pagination
 * - Row selection
 * - Action execution and modal flows
 * - State snapshots and refresh
 *
 * @typeParam TRow - The type of row data managed by the list.
 * @typeParam TRowId - The type of the unique identifier for each row.
 *
 * @param config - Configuration object containing data source, fields, actions, and initial state.
 * @returns An object containing the current state and methods to interact with the list.
 *
 * @internal
 */
export declare const useListCore: <TRow = any, TRowId extends RowId = RowId>(config: ListConfig<TRow, TRowId>) => UseListCoreResult<TRow, TRowId>;
//# sourceMappingURL=useListCore.d.ts.map