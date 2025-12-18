import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/ListDisplay.tsx
import { useMemo } from "react";
import { useListCore } from "../core/index.ts";
import { ListContainer } from "./layout/ListContainer.tsx";
import { ListToolbar } from "./layout/ListToolbar.tsx";
import { ListFiltersPanel } from "./layout/ListFiltersPanel.tsx";
import { ListSortBar } from "./layout/ListSortBar.tsx";
import { ListTable } from "./layout/ListTable.tsx";
import { ListPagination } from "./layout/ListPagination.tsx";
import { ListLoadingState } from "./states/ListLoadingState.tsx";
import { ListEmptyState } from "./states/ListEmptyState.tsx";
import { ListErrorState } from "./states/ListErrorState.tsx";
import { ListModalOutlet } from "./modals/ListModalOutlet.tsx";
/* ─────────────────────────────
 * COMPONENT
 * ───────────────────────────── */
export const ListDisplay = (props) => {
    const { components, componentsProps, idKey, ...coreConfig } = props;
    const { state, fields, generalActions, rowActions, setFilters, setSort, setPageIndex, setPageSize, clearSelection, selectAllVisible, triggerGeneralAction, triggerRowAction, confirmActiveAction, cancelActiveAction, exportState, refresh, } = useListCore({
        ...coreConfig,
        idKey,
    });
    /* COMPONENTE EFECTIVE (default sau override) */
    const { Toolbar: ToolbarSlot, FiltersPanel: FiltersPanelSlot, SortBar: SortBarSlot, Table: TableSlot, Pagination: PaginationSlot, ModalOutlet: ModalOutletSlot, LoadingState: LoadingStateSlot, EmptyState: EmptyStateSlot, ErrorState: ErrorStateSlot, } = components ?? {};
    const compProps = componentsProps ?? {};
    const ToolbarComponent = ToolbarSlot ?? ListToolbar;
    const FiltersPanelComponent = FiltersPanelSlot ?? ListFiltersPanel;
    const SortBarComponent = SortBarSlot ?? ListSortBar;
    const TableComponent = TableSlot ?? ListTable;
    const PaginationComponent = PaginationSlot ?? ListPagination;
    const ModalOutletComponent = ModalOutletSlot ?? ListModalOutlet;
    const LoadingStateComponent = LoadingStateSlot ?? ListLoadingState;
    const EmptyStateComponent = EmptyStateSlot ?? ListEmptyState;
    const ErrorStateComponent = ErrorStateSlot ?? ListErrorState;
    /* HANDLERE PENTRU UI */
    const handleChangeFilters = (next) => {
        const filters = (next ?? {});
        setFilters(() => filters);
    };
    const handleChangeSort = (fieldId) => {
        if (!fieldId) {
            setSort(undefined);
            return;
        }
        const current = state.sort;
        if (current && current.field === fieldId) {
            const nextDirection = current.direction === "asc" ? "desc" : "asc";
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
    const handlePageChange = (pageIndex) => {
        setPageIndex(pageIndex);
    };
    const handlePageSizeChange = (pageSize) => {
        setPageSize(pageSize);
    };
    const handleToolbarActionClick = (actionId) => {
        void triggerGeneralAction(actionId);
    };
    const handleRowActionClick = (actionId, rowIndex) => {
        void triggerRowAction(actionId, rowIndex);
    };
    const handleModalConfirm = (payload) => {
        void confirmActiveAction(payload);
    };
    const handleModalCancel = () => {
        cancelActiveAction();
    };
    /* STATE DERIVAT PENTRU UI */
    const isLoading = state.status === "loading" &&
        (!state.rows || state.rows.length === 0);
    const hasError = state.status === "error";
    const isEmpty = state.status === "ready" &&
        state.rows &&
        state.rows.length === 0;
    const loadingMessage = "Loading data...";
    const emptyMessage = "No data available.";
    const errorMessage = "An error occurred while loading data.";
    const snapshotForExport = useMemo(() => exportState(), [exportState]);
    void snapshotForExport; // ca să nu comenteze linterul, până îl folosești efectiv
    /* RENDER */
    return (_jsxs(ListContainer, { className: "ld-list", children: [_jsx(ToolbarComponent, { ...compProps.Toolbar, state: state, generalActions: generalActions, onActionClick: handleToolbarActionClick }), _jsx(FiltersPanelComponent, { ...compProps.FiltersPanel, state: state, fields: fields, onChangeFilters: handleChangeFilters }), _jsx(SortBarComponent, { ...compProps.SortBar, state: state, fields: fields, onChangeSort: handleChangeSort }), isLoading && (_jsx(LoadingStateComponent, { ...compProps.LoadingState, message: loadingMessage })), hasError && !isLoading && (_jsx(ErrorStateComponent, { ...compProps.ErrorState, message: errorMessage })), isEmpty && !isLoading && !hasError && (_jsx(EmptyStateComponent, { ...compProps.EmptyState, message: emptyMessage })), !isLoading && !hasError && state.rows && state.rows.length > 0 && (_jsxs(_Fragment, { children: [_jsx(TableComponent, { ...compProps.Table, state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: handleRowActionClick }), _jsx(PaginationComponent, { ...compProps.Pagination, state: state, onChangePage: handlePageChange, onChangePageSize: handlePageSizeChange })] })), _jsx(ModalOutletComponent, { ...compProps.ModalOutlet, state: state, generalActions: generalActions, rowActions: rowActions, onConfirm: handleModalConfirm, onCancel: handleModalCancel })] }));
};
export default ListDisplay;
