/**
 * Core hook module that encapsulates the data-management logic for ListDisplay.
 * This module provides the main `useListCore` hook which wires a data source,
 * schema metadata, and optional actions into a cohesive state machine that can
 * be consumed by UI components.
 *
 * @internal
 */

import {useCallback, useEffect, useMemo, useState,} from "react";

import type {
    DataPatch,
    FieldSchema,
    GeneralAction,
    ListConfig,
    ListSnapshot,
    ListState,
    RowAction,
    RowId,
    SelectionMode
} from "../types";

import {applyFilters} from "./filters";
import {applySorting} from "./sorting";
import {applyPagination, updatePaginationMeta} from "./pagination";
import {clearSelection, createSelectionState, selectAllVisible,} from "./selection";
import {
    clearActiveAction as clearActiveActionUi,
    closeModal as closeModalUi,
    createInitialUiState,
    openModalForAction,
} from "./uiState";
import {buildSnapshot} from "./snapshots";
import {applyPatch} from "../dataSource";

/* ─────────────────────────────
 * TYPES
 * ───────────────────────────── */

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
export interface UseListCoreResult<
    TRow = any,
    TRowId extends RowId = RowId,
> {
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

    /* FILTERS */
    /**
     * Updates the active filters map.
     * Accepts an updater function that receives the previous filters and returns the new filters.
     * Triggers a recomputation of derived state including filtering, sorting, and pagination.
     *
     * @param updater - Function that receives the previous filters and returns the new filters.
     */
    setFilters: (updater: (prev: ListState<TRow>["filters"]) => ListState<TRow>["filters"]) => void;

    /* SORTING */
    /**
     * Sets the active sort descriptor.
     * Triggers a recomputation of derived state including sorting and pagination.
     *
     * @param sort - The new sort descriptor or undefined to clear sorting.
     */
    setSort: (sort: ListState<TRow>["sort"] | undefined) => void;

    /* PAGINATION */
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

    /* SELECTION */
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

    /* ACTIONS */
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

    /* MODAL FLOW */
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

    /* META */
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

/* ─────────────────────────────
 * HELPERS
 * ───────────────────────────── */

/**
 * Default number of rows to display per page when pagination is enabled.
 *
 * @internal
 */
const DEFAULT_PAGE_SIZE = 25;

/**
 * Initializes the selection state based on the provided selection mode.
 *
 * @param mode - The selection mode to initialize (none, single, or multiple).
 * @returns A new selection state object.
 *
 * @internal
 */
const initSelection = (mode: SelectionMode | undefined) =>
    createSelectionState(mode ?? "none");

/**
 * Recomputes derived parts of the list state:
 * - filters
 * - sorting
 * - pagination metadata
 * - visible rows
 *
 * This function applies filters, sorting, and pagination in sequence to produce
 * the final set of visible rows. It is the core computation pipeline for the list.
 *
 * @typeParam TRow - The type of row data managed by the list.
 * @param prevState - The previous list state to derive from.
 * @param fields - Field schema definitions used for filtering and sorting.
 * @param rawRowsOverride - Optional override for the raw rows array. If not provided, uses prevState.rawRows.
 * @returns A new list state with updated derived properties.
 *
 * @internal
 */
const recomputeDerived = <TRow = any>(
    prevState: ListState<TRow>,
    fields: Array<FieldSchema<TRow>>,
    rawRowsOverride?: TRow[]
): ListState<TRow> => {
    const rawRows = rawRowsOverride ?? prevState.rawRows;

    // 1. filters
    const filtered = applyFilters<TRow>(rawRows, {
        filters: prevState.filters,
        fields,
    });

    // 2. sorting
    const sorted = applySorting<TRow>(filtered, {
        sort: prevState.sort,
        fields,
    });

    // 3. pagination meta
    const nextPagination = updatePaginationMeta(
        prevState.pagination,
        sorted.length
    );

    // 4. page slice
    const paged = applyPagination<TRow>(sorted, nextPagination);

    return {
        ...prevState,
        rawRows,
        rows: paged,
        pagination: nextPagination,
    };
};

/* ─────────────────────────────
 * HOOK
 * ───────────────────────────── */

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
export const useListCore = <
    TRow = any,
    TRowId extends RowId = RowId,
>(
    config: ListConfig<TRow, TRowId>
): UseListCoreResult<TRow, TRowId> => {
    const {
        dataSource,
        fields,
        idKey,
        generalActions,
        rowActions,
        initialFilters,
        initialPagination,
        initialSort,
        selectionMode,
    } = config;

    /* INITIAL STATE */

    const [state, setState] = useState<ListState<TRow>>(() => ({
        rawRows: [],
        rows: [],
        filters: initialFilters ?? {},
        sort: initialSort,
        pagination: {
            pageIndex: initialPagination?.pageIndex ?? 0,
            pageSize: initialPagination?.pageSize ?? DEFAULT_PAGE_SIZE,
            totalItems: initialPagination?.totalItems,
            totalPages: initialPagination?.totalPages,
        },
        selection: initSelection(selectionMode),
        status: "idle",
        error: undefined,
        ui: createInitialUiState(),
    }));

    /* DATA LOADING */

    const loadInitial = useCallback(async () => {
        setState((prev) => ({
            ...prev,
            status: "loading",
            error: undefined,
        }));

        try {
            const result = await dataSource.init();
            setState((prev) =>
                recomputeDerived<TRow>(
                    {
                        ...prev,
                        rawRows: result.rows ?? [],
                        status: result.status ?? "ready",
                        error: undefined,
                        pagination: {
                            ...prev.pagination,
                            // totalItems & totalPages will be recalculated
                        },
                    },
                    fields
                )
            );
        } catch (err) {
            setState((prev) => ({
                ...prev,
                status: "error",
                error: err,
            }));
        }
    }, [dataSource, fields]);

    useEffect(() => {
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadInitial]);

    /* SUBSCRIBE TO STREAM PATCHES (if any) */

    useEffect(() => {
        if (!dataSource.subscribe) {
            return;
        }

        const unsubscribe = dataSource.subscribe(
            (patch: DataPatch<TRow, TRowId>) => {
                setState((prev) => {
                    const nextRaw = applyPatch<TRow, TRowId>(
                        prev.rawRows,
                        patch,
                        idKey
                    );
                    return recomputeDerived<TRow>(prev, fields, nextRaw);
                });
            }
        );

        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
            if (dataSource.destroy) {
                dataSource.destroy();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataSource, fields, idKey]);

    /* REFRESH */

    const refresh = useCallback(async () => {
        // Simple and clear: re-run init()
        await loadInitial();
    }, [loadInitial]);

    /* EXPORT SNAPSHOT */

    const exportState = useCallback(
        (): ListSnapshot<TRow, TRowId> => buildSnapshot<TRow, TRowId>(state),
        [state]
    );

    /* FILTERS */

    const setFilters = useCallback(
        (updater: (prev: ListState<TRow>["filters"]) => ListState<TRow>["filters"]) => {
            setState((prev) => {
                const nextFilters = updater(prev.filters);
                return recomputeDerived<TRow>(
                    {
                        ...prev,
                        filters: nextFilters,
                    },
                    fields
                );
            });
        },
        [fields]
    );

    /* SORTING */

    const setSort = useCallback(
        (sort: ListState<TRow>["sort"] | undefined) => {
            setState((prev) =>
                recomputeDerived<TRow>(
                    {
                        ...prev,
                        sort,
                    },
                    fields
                )
            );
        },
        [fields]
    );

    /* PAGINATION */

    const setPageIndex = useCallback((pageIndex: number) => {
        setState((prev) =>
            recomputeDerived<TRow>(
                {
                    ...prev,
                    pagination: {
                        ...prev.pagination,
                        pageIndex,
                    },
                },
                fields
            )
        );
    }, [fields]);

    const setPageSize = useCallback((pageSize: number) => {
        setState((prev) =>
            recomputeDerived<TRow>(
                {
                    ...prev,
                    pagination: {
                        ...prev.pagination,
                        pageSize,
                        pageIndex: 0, // reset to first page when pageSize changes
                    },
                },
                fields
            )
        );
    }, [fields]);

    /* SELECTION */

    const doClearSelection = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selection: clearSelection(prev.selection),
        }));
    }, []);

    const doSelectAllVisible = useCallback(() => {
        setState((prev) => ({
            ...prev,
            selection: selectAllVisible<TRow, TRowId>(
                prev.rows,
                prev.selection as any,
                {
                    mode: prev.selection.mode,
                    idKey: idKey as keyof TRow & string,
                }
            ),
        }));
    }, [idKey]);

    /* INTERNAL: EXEC ACTION HANDLERS */

    const runGeneralActionHandler = useCallback(
        async (action: GeneralAction<TRow, TRowId>) => {
            if (!action.handler) {
                return;
            }

            // build the context from the *current* state
            const snapshot = exportState();

            const updateRows = (updater: (current: TRow[]) => TRow[]) => {
                setState((prev) => {
                    const nextRaw = updater(prev.rawRows);
                    return recomputeDerived<TRow>(prev, fields, nextRaw);
                });
            };

            const ctx = {
                rows: snapshot.rowsAll,
                visibleRows: snapshot.rowsVisible,
                selection: snapshot.selection,
                filters: snapshot.filters,
                sort: snapshot.sort,
                pagination: snapshot.pagination,
                updateRows,
                exportState,
                refresh,
            };

            await action.handler(ctx);
        },
        [exportState, fields, refresh]
    );

    const runRowActionHandler = useCallback(
        async (
            action: RowAction<TRow, TRowId>,
            rowIndex: number
        ) => {
            if (!action.handler) {
                return;
            }

            const snapshot = exportState();
            const row = snapshot.rowsVisible[rowIndex];
            if (!row) {
                return;
            }

            const updateRows = (updater: (current: TRow[]) => TRow[]) => {
                setState((prev) => {
                    const nextRaw = updater(prev.rawRows);
                    return recomputeDerived<TRow>(prev, fields, nextRaw);
                });
            };

            const ctx = {
                rows: snapshot.rowsAll,
                visibleRows: snapshot.rowsVisible,
                selection: snapshot.selection,
                filters: snapshot.filters,
                sort: snapshot.sort,
                pagination: snapshot.pagination,
                updateRows,
                exportState,
                refresh,
                row,
                rowIndex,
            };

            await action.handler(ctx);
        },
        [exportState, fields, refresh]
    );

    /* ACTION TRIGGERS (GENERAL & ROW) */

    const triggerGeneralAction = useCallback(
        async (actionId: string) => {
            const action = (generalActions ?? []).find(
                (a) => a.id === actionId
            );
            if (!action) {
                return;
            }

            if (action.opensModal && action.modal) {
                setState((prev) => ({
                    ...prev,
                    ui: openModalForAction(prev.ui, action.id, "general"),
                }));
                return;
            }

            await runGeneralActionHandler(action);
        },
        [generalActions, runGeneralActionHandler]
    );

    const triggerRowAction = useCallback(
        async (actionId: string, rowIndex: number) => {
            const action = (rowActions ?? []).find(
                (a) => a.id === actionId
            );
            if (!action) {
                return;
            }

            if (action.opensModal && action.modal) {
                // identify rowId for uiState
                const row = state.rows[rowIndex];
                const rowId = row ? ((row as any)[idKey] as TRowId) : undefined;

                setState((prev) => ({
                    ...prev,
                    ui: openModalForAction(
                        prev.ui,
                        action.id,
                        "row",
                        rowId as RowId | undefined
                    ),
                }));
                return;
            }

            await runRowActionHandler(action, rowIndex);
        },
        [rowActions, runRowActionHandler, state.rows, idKey]
    );

    /* MODAL CONFIRM / CANCEL */

    const confirmActiveAction = useCallback(
        async (payload?: unknown) => {
            const {ui} = state;
            const active = ui.activeAction;
            if (!active) {
                return;
            }

            if (active.type === "general") {
                const action = (generalActions ?? []).find(
                    (a) => a.id === active.actionId
                );
                if (action) {
                    // for now we ignore payload here; it can be integrated in handler via CustomModalConfig if you want
                    await runGeneralActionHandler(action);
                }
            } else {
                const action = (rowActions ?? []).find(
                    (a) => a.id === active.actionId
                );
                if (action) {
                    // find rowIndex based on rowId from uiState
                    const rowId = active.rowId as TRowId | undefined;
                    let rowIndex = -1;
                    if (rowId != null) {
                        rowIndex = state.rows.findIndex(
                            (r) => ((r as any)[idKey] as TRowId) === rowId
                        );
                    }

                    if (rowIndex >= 0) {
                        await runRowActionHandler(action, rowIndex);
                    }
                }
            }

            // close the modal and reset the active action
            setState((prev) => ({
                ...prev,
                ui: clearActiveActionUi(closeModalUi(prev.ui)),
            }));
        },
        [
            state,
            generalActions,
            rowActions,
            runGeneralActionHandler,
            runRowActionHandler,
            idKey,
        ]
    );

    const cancelActiveAction = useCallback(() => {
        setState((prev) => ({
            ...prev,
            ui: clearActiveActionUi(closeModalUi(prev.ui)),
        }));
    }, []);

    /* MEMO RESULT */

    return useMemo(
        () => ({
            state,
            fields,
            generalActions,
            rowActions,

            setFilters,
            setSort,
            setPageIndex,
            setPageSize,

            clearSelection: doClearSelection,
            selectAllVisible: doSelectAllVisible,

            triggerGeneralAction,
            triggerRowAction,

            confirmActiveAction,
            cancelActiveAction,

            exportState,
            refresh,
        }),
        [
            state,
            fields,
            generalActions,
            rowActions,
            setFilters,
            setSort,
            setPageIndex,
            setPageSize,
            doClearSelection,
            doSelectAllVisible,
            triggerGeneralAction,
            triggerRowAction,
            confirmActiveAction,
            cancelActiveAction,
            exportState,
            refresh,
        ]
    );
};
