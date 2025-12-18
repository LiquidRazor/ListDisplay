// src/core/useListCore.ts
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
var DEFAULT_PAGE_SIZE = 25;
var initSelection = function (mode) {
    return createSelectionState(mode !== null && mode !== void 0 ? mode : "none");
};
/**
 * Recomputes derived parts of the list state:
 * - filters
 * - sorting
 * - pagination metadata
 * - visible rows
 */
var recomputeDerived = function (prevState, fields, rawRowsOverride) {
    var rawRows = rawRowsOverride !== null && rawRowsOverride !== void 0 ? rawRowsOverride : prevState.rawRows;
    // 1. filters
    var filtered = applyFilters(rawRows, {
        filters: prevState.filters,
        fields: fields,
    });
    // 2. sorting
    var sorted = applySorting(filtered, {
        sort: prevState.sort,
        fields: fields,
    });
    // 3. pagination meta
    var nextPagination = updatePaginationMeta(prevState.pagination, sorted.length);
    // 4. page slice
    var paged = applyPagination(sorted, nextPagination);
    return __assign(__assign({}, prevState), { rawRows: rawRows, rows: paged, pagination: nextPagination });
};
/* ─────────────────────────────
 * HOOK
 * ───────────────────────────── */
export var useListCore = function (config) {
    var dataSource = config.dataSource, fields = config.fields, idKey = config.idKey, generalActions = config.generalActions, rowActions = config.rowActions, initialFilters = config.initialFilters, initialPagination = config.initialPagination, initialSort = config.initialSort, selectionMode = config.selectionMode;
    /* INITIAL STATE */
    var _a = useState(function () {
        var _a, _b;
        return ({
            rawRows: [],
            rows: [],
            filters: initialFilters !== null && initialFilters !== void 0 ? initialFilters : {},
            sort: initialSort,
            pagination: {
                pageIndex: (_a = initialPagination === null || initialPagination === void 0 ? void 0 : initialPagination.pageIndex) !== null && _a !== void 0 ? _a : 0,
                pageSize: (_b = initialPagination === null || initialPagination === void 0 ? void 0 : initialPagination.pageSize) !== null && _b !== void 0 ? _b : DEFAULT_PAGE_SIZE,
                totalItems: initialPagination === null || initialPagination === void 0 ? void 0 : initialPagination.totalItems,
                totalPages: initialPagination === null || initialPagination === void 0 ? void 0 : initialPagination.totalPages,
            },
            selection: initSelection(selectionMode),
            status: "idle",
            error: undefined,
            ui: createInitialUiState(),
        });
    }), state = _a[0], setState = _a[1];
    /* DATA LOADING */
    var loadInitial = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var result_1, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setState(function (prev) { return (__assign(__assign({}, prev), { status: "loading", error: undefined })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, dataSource.init()];
                case 2:
                    result_1 = _a.sent();
                    setState(function (prev) {
                        var _a, _b;
                        return recomputeDerived(__assign(__assign({}, prev), { rawRows: (_a = result_1.rows) !== null && _a !== void 0 ? _a : [], status: (_b = result_1.status) !== null && _b !== void 0 ? _b : "ready", error: undefined, pagination: __assign({}, prev.pagination) }), fields);
                    });
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    setState(function (prev) { return (__assign(__assign({}, prev), { status: "error", error: err_1 })); });
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [dataSource, fields]);
    useEffect(function () {
        loadInitial();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadInitial]);
    /* SUBSCRIBE TO STREAM PATCHES (if any) */
    useEffect(function () {
        if (!dataSource.subscribe) {
            return;
        }
        var unsubscribe = dataSource.subscribe(function (patch) {
            setState(function (prev) {
                var nextRaw = applyPatch(prev.rawRows, patch, idKey);
                return recomputeDerived(prev, fields, nextRaw);
            });
        });
        return function () {
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
    var refresh = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Simplu și clar: re-run init()
                return [4 /*yield*/, loadInitial()];
                case 1:
                    // Simplu și clar: re-run init()
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [loadInitial]);
    /* EXPORT SNAPSHOT */
    var exportState = useCallback(function () { return buildSnapshot(state); }, [state]);
    /* FILTERS */
    var setFilters = useCallback(function (updater) {
        setState(function (prev) {
            var nextFilters = updater(prev.filters);
            return recomputeDerived(__assign(__assign({}, prev), { filters: nextFilters }), fields);
        });
    }, [fields]);
    /* SORTING */
    var setSort = useCallback(function (sort) {
        setState(function (prev) {
            return recomputeDerived(__assign(__assign({}, prev), { sort: sort }), fields);
        });
    }, [fields]);
    /* PAGINATION */
    var setPageIndex = useCallback(function (pageIndex) {
        setState(function (prev) {
            return recomputeDerived(__assign(__assign({}, prev), { pagination: __assign(__assign({}, prev.pagination), { pageIndex: pageIndex }) }), fields);
        });
    }, [fields]);
    var setPageSize = useCallback(function (pageSize) {
        setState(function (prev) {
            return recomputeDerived(__assign(__assign({}, prev), { pagination: __assign(__assign({}, prev.pagination), { pageSize: pageSize, pageIndex: 0 }) }), fields);
        });
    }, [fields]);
    /* SELECTION */
    var doClearSelection = useCallback(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { selection: clearSelection(prev.selection) })); });
    }, []);
    var doSelectAllVisible = useCallback(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { selection: selectAllVisible(prev.rows, prev.selection, {
                mode: prev.selection.mode,
                idKey: idKey,
            }) })); });
    }, [idKey]);
    /* INTERNAL: EXEC ACTION HANDLERS */
    var runGeneralActionHandler = useCallback(function (action) { return __awaiter(void 0, void 0, void 0, function () {
        var snapshot, updateRows, ctx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!action.handler) {
                        return [2 /*return*/];
                    }
                    snapshot = exportState();
                    updateRows = function (updater) {
                        setState(function (prev) {
                            var nextRaw = updater(prev.rawRows);
                            return recomputeDerived(prev, fields, nextRaw);
                        });
                    };
                    ctx = {
                        rows: snapshot.rowsAll,
                        visibleRows: snapshot.rowsVisible,
                        selection: snapshot.selection,
                        filters: snapshot.filters,
                        sort: snapshot.sort,
                        pagination: snapshot.pagination,
                        updateRows: updateRows,
                        exportState: exportState,
                        refresh: refresh,
                    };
                    return [4 /*yield*/, action.handler(ctx)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [exportState, fields, refresh]);
    var runRowActionHandler = useCallback(function (action, rowIndex) { return __awaiter(void 0, void 0, void 0, function () {
        var snapshot, row, updateRows, ctx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!action.handler) {
                        return [2 /*return*/];
                    }
                    snapshot = exportState();
                    row = snapshot.rowsVisible[rowIndex];
                    if (!row) {
                        return [2 /*return*/];
                    }
                    updateRows = function (updater) {
                        setState(function (prev) {
                            var nextRaw = updater(prev.rawRows);
                            return recomputeDerived(prev, fields, nextRaw);
                        });
                    };
                    ctx = {
                        rows: snapshot.rowsAll,
                        visibleRows: snapshot.rowsVisible,
                        selection: snapshot.selection,
                        filters: snapshot.filters,
                        sort: snapshot.sort,
                        pagination: snapshot.pagination,
                        updateRows: updateRows,
                        exportState: exportState,
                        refresh: refresh,
                        row: row,
                        rowIndex: rowIndex,
                    };
                    return [4 /*yield*/, action.handler(ctx)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [exportState, fields, refresh]);
    /* ACTION TRIGGERS (GENERAL & ROW) */
    var triggerGeneralAction = useCallback(function (actionId) { return __awaiter(void 0, void 0, void 0, function () {
        var action;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    action = (generalActions !== null && generalActions !== void 0 ? generalActions : []).find(function (a) { return a.id === actionId; });
                    if (!action) {
                        return [2 /*return*/];
                    }
                    if (action.opensModal && action.modal) {
                        setState(function (prev) { return (__assign(__assign({}, prev), { ui: openModalForAction(prev.ui, action.id, "general") })); });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, runGeneralActionHandler(action)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [generalActions, runGeneralActionHandler]);
    var triggerRowAction = useCallback(function (actionId, rowIndex) { return __awaiter(void 0, void 0, void 0, function () {
        var action, row, rowId_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    action = (rowActions !== null && rowActions !== void 0 ? rowActions : []).find(function (a) { return a.id === actionId; });
                    if (!action) {
                        return [2 /*return*/];
                    }
                    if (action.opensModal && action.modal) {
                        row = state.rows[rowIndex];
                        rowId_1 = row ? row[idKey] : undefined;
                        setState(function (prev) { return (__assign(__assign({}, prev), { ui: openModalForAction(prev.ui, action.id, "row", rowId_1) })); });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, runRowActionHandler(action, rowIndex)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [rowActions, runRowActionHandler, state.rows, idKey]);
    /* MODAL CONFIRM / CANCEL */
    var confirmActiveAction = useCallback(function (payload) { return __awaiter(void 0, void 0, void 0, function () {
        var ui, active, action, action, rowId_2, rowIndex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    ui = state.ui;
                    active = ui.activeAction;
                    if (!active) {
                        return [2 /*return*/];
                    }
                    if (!(active.type === "general")) return [3 /*break*/, 3];
                    action = (generalActions !== null && generalActions !== void 0 ? generalActions : []).find(function (a) { return a.id === active.actionId; });
                    if (!action) return [3 /*break*/, 2];
                    // deocamdată ignorăm payload aici; se poate integra în handler via CustomModalConfig dacă vrei
                    return [4 /*yield*/, runGeneralActionHandler(action)];
                case 1:
                    // deocamdată ignorăm payload aici; se poate integra în handler via CustomModalConfig dacă vrei
                    _a.sent();
                    _a.label = 2;
                case 2: return [3 /*break*/, 5];
                case 3:
                    action = (rowActions !== null && rowActions !== void 0 ? rowActions : []).find(function (a) { return a.id === active.actionId; });
                    if (!action) return [3 /*break*/, 5];
                    rowId_2 = active.rowId;
                    rowIndex = -1;
                    if (rowId_2 != null) {
                        rowIndex = state.rows.findIndex(function (r) { return r[idKey] === rowId_2; });
                    }
                    if (!(rowIndex >= 0)) return [3 /*break*/, 5];
                    return [4 /*yield*/, runRowActionHandler(action, rowIndex)];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    // închidem modalul și resetăm acțiunea activă
                    setState(function (prev) { return (__assign(__assign({}, prev), { ui: clearActiveActionUi(closeModalUi(prev.ui)) })); });
                    return [2 /*return*/];
            }
        });
    }); }, [
        state,
        generalActions,
        rowActions,
        runGeneralActionHandler,
        runRowActionHandler,
        idKey,
    ]);
    var cancelActiveAction = useCallback(function () {
        setState(function (prev) { return (__assign(__assign({}, prev), { ui: clearActiveActionUi(closeModalUi(prev.ui)) })); });
    }, []);
    /* MEMO RESULT */
    return useMemo(function () { return ({
        state: state,
        fields: fields,
        generalActions: generalActions,
        rowActions: rowActions,
        setFilters: setFilters,
        setSort: setSort,
        setPageIndex: setPageIndex,
        setPageSize: setPageSize,
        clearSelection: doClearSelection,
        selectAllVisible: doSelectAllVisible,
        triggerGeneralAction: triggerGeneralAction,
        triggerRowAction: triggerRowAction,
        confirmActiveAction: confirmActiveAction,
        cancelActiveAction: cancelActiveAction,
        exportState: exportState,
        refresh: refresh,
    }); }, [
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