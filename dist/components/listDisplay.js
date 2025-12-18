import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Main list display component module.
 *
 * @remarks
 * This module provides the primary {@link ListDisplay} component which renders
 * a complete data list experience with filtering, sorting, pagination, and
 * action support. It leverages a ListCore for state management and
 * exposes a slot-based architecture for customization.
 *
 * @packageDocumentation
 * @public
 */
import { useMemo } from "react";
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
/**
 * High-level component that renders the entire ListDisplay experience using
 * the core hook for state management and a set of slot-based components for
 * the UI. Consumers can override any slot via the {@link ListConfig.components}
 * map while still benefiting from the built-in behaviours.
 *
 * @remarks
 * This component orchestrates the complete list UI including:
 * - Toolbar with general actions
 * - Filters panel for data filtering
 * - Sort bar for column sorting
 * - Table with rows and row actions
 * - Pagination controls
 * - Modal outlet for action confirmations
 * - Loading, empty, and error states
 *
 * All sub-components can be replaced via the `components` prop while maintaining
 * full integration with the core state management layer.
 *
 * @param props - Configuration object containing data source, fields, actions, and UI customization options. See {@link ListDisplayProps}.
 * @returns A complete list UI with all interactive features enabled.
 *
 * @public
 */
export const ListDisplay = (props) => {
    const { components, componentsProps, idKey, ...coreConfig } = props;
    const { state, fields, generalActions, rowActions, setFilters, setSort, setPageIndex, setPageSize, clearSelection, selectAllVisible, triggerGeneralAction, triggerRowAction, confirmActiveAction, cancelActiveAction, exportState, refresh, } = useListCore({
        ...coreConfig,
        idKey,
    });
    /* EFFECTIVE COMPONENTS (default or override) */
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
    /* HANDLERS FOR UI */
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
    /* DERIVED STATE FOR UI */
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
    void snapshotForExport; // to prevent linter warnings until it's actually used
    /* RENDER */
    return (_jsxs(ListContainer, { className: "ld-list", children: [_jsx(ToolbarComponent, { ...compProps.Toolbar, state: state, generalActions: generalActions, onActionClick: handleToolbarActionClick }), _jsx(FiltersPanelComponent, { ...compProps.FiltersPanel, state: state, fields: fields, onChangeFilters: handleChangeFilters }), _jsx(SortBarComponent, { ...compProps.SortBar, state: state, fields: fields, onChangeSort: handleChangeSort }), isLoading && (_jsx(LoadingStateComponent, { ...compProps.LoadingState, message: loadingMessage })), hasError && !isLoading && (_jsx(ErrorStateComponent, { ...compProps.ErrorState, message: errorMessage })), isEmpty && !isLoading && !hasError && (_jsx(EmptyStateComponent, { ...compProps.EmptyState, message: emptyMessage })), !isLoading && !hasError && state.rows && state.rows.length > 0 && (_jsxs(_Fragment, { children: [_jsx(TableComponent, { ...compProps.Table, state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: handleRowActionClick }), _jsx(PaginationComponent, { ...compProps.Pagination, state: state, onChangePage: handlePageChange, onChangePageSize: handlePageSizeChange })] })), _jsx(ModalOutletComponent, { ...compProps.ModalOutlet, state: state, generalActions: generalActions, rowActions: rowActions, onConfirm: handleModalConfirm, onCancel: handleModalCancel })] }));
};
export default ListDisplay;
//# sourceMappingURL=listDisplay.js.map