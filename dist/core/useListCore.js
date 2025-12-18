import { useCallback, useEffect, useMemo, useState, } from "react";
import { applyFilters } from "./filters";
import { applySorting } from "./sorting";
import { applyPagination, updatePaginationMeta } from "./pagination";
import { clearSelection, createSelectionState, selectAllVisible, } from "./selection";
import { clearActiveAction as clearActiveActionUi, closeModal as closeModalUi, createInitialUiState, openModalForAction, } from "./uiState";
import { buildSnapshot } from "./snapshots";
import { applyPatch } from "../dataSource";
/* ─────────────────────────────
 * HELPERS
 * ───────────────────────────── */
const DEFAULT_PAGE_SIZE = 25;
const initSelection = (mode) => createSelectionState(mode ?? "none");
/**
 * Recomputes derived parts of the list state:
 * - filters
 * - sorting
 * - pagination metadata
 * - visible rows
 */
const recomputeDerived = (prevState, fields, rawRowsOverride) => {
    const rawRows = rawRowsOverride ?? prevState.rawRows;
    // 1. filters
    const filtered = applyFilters(rawRows, {
        filters: prevState.filters,
        fields,
    });
    // 2. sorting
    const sorted = applySorting(filtered, {
        sort: prevState.sort,
        fields,
    });
    // 3. pagination meta
    const nextPagination = updatePaginationMeta(prevState.pagination, sorted.length);
    // 4. page slice
    const paged = applyPagination(sorted, nextPagination);
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
 */
export const useListCore = (config) => {
    const { dataSource, fields, idKey, generalActions, rowActions, initialFilters, initialPagination, initialSort, selectionMode, } = config;
    /* INITIAL STATE */
    const [state, setState] = useState(() => ({
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
            setState((prev) => recomputeDerived({
                ...prev,
                rawRows: result.rows ?? [],
                status: result.status ?? "ready",
                error: undefined,
                pagination: {
                    ...prev.pagination,
                    // totalItems & totalPages will be recalculated
                },
            }, fields));
        }
        catch (err) {
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
        const unsubscribe = dataSource.subscribe((patch) => {
            setState((prev) => {
                const nextRaw = applyPatch(prev.rawRows, patch, idKey);
                return recomputeDerived(prev, fields, nextRaw);
            });
        });
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
    const exportState = useCallback(() => buildSnapshot(state), [state]);
    /* FILTERS */
    const setFilters = useCallback((updater) => {
        setState((prev) => {
            const nextFilters = updater(prev.filters);
            return recomputeDerived({
                ...prev,
                filters: nextFilters,
            }, fields);
        });
    }, [fields]);
    /* SORTING */
    const setSort = useCallback((sort) => {
        setState((prev) => recomputeDerived({
            ...prev,
            sort,
        }, fields));
    }, [fields]);
    /* PAGINATION */
    const setPageIndex = useCallback((pageIndex) => {
        setState((prev) => recomputeDerived({
            ...prev,
            pagination: {
                ...prev.pagination,
                pageIndex,
            },
        }, fields));
    }, [fields]);
    const setPageSize = useCallback((pageSize) => {
        setState((prev) => recomputeDerived({
            ...prev,
            pagination: {
                ...prev.pagination,
                pageSize,
                pageIndex: 0, // reset to first page when pageSize changes
            },
        }, fields));
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
            selection: selectAllVisible(prev.rows, prev.selection, {
                mode: prev.selection.mode,
                idKey: idKey,
            }),
        }));
    }, [idKey]);
    /* INTERNAL: EXEC ACTION HANDLERS */
    const runGeneralActionHandler = useCallback(async (action) => {
        if (!action.handler) {
            return;
        }
        // build the context from the *current* state
        const snapshot = exportState();
        const updateRows = (updater) => {
            setState((prev) => {
                const nextRaw = updater(prev.rawRows);
                return recomputeDerived(prev, fields, nextRaw);
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
    }, [exportState, fields, refresh]);
    const runRowActionHandler = useCallback(async (action, rowIndex) => {
        if (!action.handler) {
            return;
        }
        const snapshot = exportState();
        const row = snapshot.rowsVisible[rowIndex];
        if (!row) {
            return;
        }
        const updateRows = (updater) => {
            setState((prev) => {
                const nextRaw = updater(prev.rawRows);
                return recomputeDerived(prev, fields, nextRaw);
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
    }, [exportState, fields, refresh]);
    /* ACTION TRIGGERS (GENERAL & ROW) */
    const triggerGeneralAction = useCallback(async (actionId) => {
        const action = (generalActions ?? []).find((a) => a.id === actionId);
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
    }, [generalActions, runGeneralActionHandler]);
    const triggerRowAction = useCallback(async (actionId, rowIndex) => {
        const action = (rowActions ?? []).find((a) => a.id === actionId);
        if (!action) {
            return;
        }
        if (action.opensModal && action.modal) {
            // identify rowId for uiState
            const row = state.rows[rowIndex];
            const rowId = row ? row[idKey] : undefined;
            setState((prev) => ({
                ...prev,
                ui: openModalForAction(prev.ui, action.id, "row", rowId),
            }));
            return;
        }
        await runRowActionHandler(action, rowIndex);
    }, [rowActions, runRowActionHandler, state.rows, idKey]);
    /* MODAL CONFIRM / CANCEL */
    const confirmActiveAction = useCallback(async (payload) => {
        const { ui } = state;
        const active = ui.activeAction;
        if (!active) {
            return;
        }
        if (active.type === "general") {
            const action = (generalActions ?? []).find((a) => a.id === active.actionId);
            if (action) {
                // for now we ignore payload here; it can be integrated in handler via CustomModalConfig if you want
                await runGeneralActionHandler(action);
            }
        }
        else {
            const action = (rowActions ?? []).find((a) => a.id === active.actionId);
            if (action) {
                // find rowIndex based on rowId from uiState
                const rowId = active.rowId;
                let rowIndex = -1;
                if (rowId != null) {
                    rowIndex = state.rows.findIndex((r) => r[idKey] === rowId);
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
    }, [
        state,
        generalActions,
        rowActions,
        runGeneralActionHandler,
        runRowActionHandler,
        idKey,
    ]);
    const cancelActiveAction = useCallback(() => {
        setState((prev) => ({
            ...prev,
            ui: clearActiveActionUi(closeModalUi(prev.ui)),
        }));
    }, []);
    /* MEMO RESULT */
    return useMemo(() => ({
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
    }), [
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
    ]);
};
//# sourceMappingURL=useListCore.js.map