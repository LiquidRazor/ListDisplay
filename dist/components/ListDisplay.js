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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ListDisplay.tsx
import React, { useMemo } from "react";
import { useListCore } from "../core";
import { ListContainer } from "./layout/ListContainer";
import { ListToolbar } from "./layout/ListToolbar";
import { ListFiltersPanel } from "./layout/ListFiltersPanel";
import { ListSortBar } from "./layout/ListSortBar";
import { ListTable } from "./layout/ListTable";
import { ListPagination } from "./layout/ListPagination";
import { ListLoadingState } from "./states/ListLoadingState";
import { ListEmptyState } from "./states/ListEmptyState";
import { ListErrorState } from "./states/ListErrorState";
import { ListModalOutlet } from "./modals/ListModalOutlet";
/* ─────────────────────────────
 * COMPONENT
 * ───────────────────────────── */
export var ListDisplay = function (props) {
    var components = props.components, componentsProps = props.componentsProps, idKey = props.idKey, coreConfig = __rest(props, ["components", "componentsProps", "idKey"]);
    var _a = useListCore(__assign(__assign({}, coreConfig), { idKey: idKey })), state = _a.state, fields = _a.fields, generalActions = _a.generalActions, rowActions = _a.rowActions, setFilters = _a.setFilters, setSort = _a.setSort, setPageIndex = _a.setPageIndex, setPageSize = _a.setPageSize, clearSelection = _a.clearSelection, selectAllVisible = _a.selectAllVisible, triggerGeneralAction = _a.triggerGeneralAction, triggerRowAction = _a.triggerRowAction, confirmActiveAction = _a.confirmActiveAction, cancelActiveAction = _a.cancelActiveAction, exportState = _a.exportState, refresh = _a.refresh;
    /* COMPONENTE EFECTIVE (default sau override) */
    var _b = components !== null && components !== void 0 ? components : {}, ToolbarSlot = _b.Toolbar, FiltersPanelSlot = _b.FiltersPanel, SortBarSlot = _b.SortBar, TableSlot = _b.Table, PaginationSlot = _b.Pagination, ModalOutletSlot = _b.ModalOutlet, LoadingStateSlot = _b.LoadingState, EmptyStateSlot = _b.EmptyState, ErrorStateSlot = _b.ErrorState;
    var compProps = componentsProps !== null && componentsProps !== void 0 ? componentsProps : {};
    var ToolbarComponent = ToolbarSlot !== null && ToolbarSlot !== void 0 ? ToolbarSlot : ListToolbar;
    var FiltersPanelComponent = FiltersPanelSlot !== null && FiltersPanelSlot !== void 0 ? FiltersPanelSlot : ListFiltersPanel;
    var SortBarComponent = SortBarSlot !== null && SortBarSlot !== void 0 ? SortBarSlot : ListSortBar;
    var TableComponent = TableSlot !== null && TableSlot !== void 0 ? TableSlot : ListTable;
    var PaginationComponent = PaginationSlot !== null && PaginationSlot !== void 0 ? PaginationSlot : ListPagination;
    var ModalOutletComponent = ModalOutletSlot !== null && ModalOutletSlot !== void 0 ? ModalOutletSlot : ListModalOutlet;
    var LoadingStateComponent = LoadingStateSlot !== null && LoadingStateSlot !== void 0 ? LoadingStateSlot : ListLoadingState;
    var EmptyStateComponent = EmptyStateSlot !== null && EmptyStateSlot !== void 0 ? EmptyStateSlot : ListEmptyState;
    var ErrorStateComponent = ErrorStateSlot !== null && ErrorStateSlot !== void 0 ? ErrorStateSlot : ListErrorState;
    /* HANDLERE PENTRU UI */
    var handleChangeFilters = function (next) {
        var filters = (next !== null && next !== void 0 ? next : {});
        setFilters(function () { return filters; });
    };
    var handleChangeSort = function (fieldId) {
        if (!fieldId) {
            setSort(undefined);
            return;
        }
        var current = state.sort;
        if (current && current.field === fieldId) {
            var nextDirection = current.direction === "asc" ? "desc" : "asc";
            setSort({
                field: current.field,
                direction: nextDirection,
            });
        }
        else {
            setSort({
                field: fieldId,
                direction: "asc",
            });
        }
    };
    var handlePageChange = function (pageIndex) {
        setPageIndex(pageIndex);
    };
    var handlePageSizeChange = function (pageSize) {
        setPageSize(pageSize);
    };
    var handleToolbarActionClick = function (actionId) {
        void triggerGeneralAction(actionId);
    };
    var handleRowActionClick = function (actionId, rowIndex) {
        void triggerRowAction(actionId, rowIndex);
    };
    var handleModalConfirm = function (payload) {
        void confirmActiveAction(payload);
    };
    var handleModalCancel = function () {
        cancelActiveAction();
    };
    /* STATE DERIVAT PENTRU UI */
    var isLoading = state.status === "loading" &&
        (!state.rows || state.rows.length === 0);
    var hasError = state.status === "error";
    var isEmpty = state.status === "ready" &&
        state.rows &&
        state.rows.length === 0;
    var loadingMessage = "Loading data...";
    var emptyMessage = "No data available.";
    var errorMessage = "An error occurred while loading data.";
    var snapshotForExport = useMemo(function () { return exportState(); }, [exportState]);
    void snapshotForExport; // ca să nu comenteze linterul, până îl folosești efectiv
    /* RENDER */
    return (_jsxs(ListContainer, { className: "ld-list", children: [_jsx(ToolbarComponent, __assign({}, compProps.Toolbar, { state: state, generalActions: generalActions, onActionClick: handleToolbarActionClick })), _jsx(FiltersPanelComponent, __assign({}, compProps.FiltersPanel, { state: state, fields: fields, onChangeFilters: handleChangeFilters })), _jsx(SortBarComponent, __assign({}, compProps.SortBar, { state: state, fields: fields, onChangeSort: handleChangeSort })), isLoading && (_jsx(LoadingStateComponent, __assign({}, compProps.LoadingState, { message: loadingMessage }))), hasError && !isLoading && (_jsx(ErrorStateComponent, __assign({}, compProps.ErrorState, { message: errorMessage }))), isEmpty && !isLoading && !hasError && (_jsx(EmptyStateComponent, __assign({}, compProps.EmptyState, { message: emptyMessage }))), !isLoading && !hasError && state.rows && state.rows.length > 0 && (_jsxs(_Fragment, { children: [_jsx(TableComponent, __assign({}, compProps.Table, { state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: handleRowActionClick })), _jsx(PaginationComponent, __assign({}, compProps.Pagination, { state: state, onChangePage: handlePageChange, onChangePageSize: handlePageSizeChange }))] })), _jsx(ModalOutletComponent, __assign({}, compProps.ModalOutlet, { state: state, generalActions: generalActions, rowActions: rowActions, onConfirm: handleModalConfirm, onCancel: handleModalCancel }))] }));
};
export default ListDisplay;
//# sourceMappingURL=ListDisplay.js.map