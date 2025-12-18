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

import React, {useMemo} from "react";

import type {ListConfig} from "../types";
import type {ListComponents, ListComponentsProps, ActiveFilterState} from "../types";

import {useListCore} from "../core";

import {ListContainer} from "./layout/ListContainer";
import {ListToolbar} from "./layout/ListToolbar";
import {ListFiltersPanel} from "./layout/ListFiltersPanel";
import {ListSortBar} from "./layout/ListSortBar";
import {ListTable} from "./layout/ListTable";
import {ListPagination} from "./layout/ListPagination";

import {ListLoadingState} from "./states/ListLoadingState";
import {ListEmptyState} from "./states/ListEmptyState";
import {ListErrorState} from "./states/ListErrorState";

import {ListModalOutlet} from "./modals/ListModalOutlet";

/* ─────────────────────────────
 * PROPS
 * ───────────────────────────── */

/**
 * Props forwarded to {@link ListDisplay}. They mirror {@link ListConfig}
 * and therefore describe the full data, schema, and action configuration for
 * the list.
 *
 * @remarks
 * This type is a direct alias to {@link ListConfig} with generic parameters
 * set to `any`. It allows the list to work with any row type and row ID type.
 * Consumers should provide appropriate configuration including data source,
 * field schemas, actions, and optional component overrides.
 *
 * @public
 */
export type ListDisplayProps = ListConfig<any, any>;

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
export const ListDisplay: React.FC<ListDisplayProps> = (props) => {
    const {
        components,
        componentsProps,
        idKey,
        ...coreConfig
    } = props;

    const {
        state,
        fields,
        generalActions,
        rowActions,
        setFilters,
        setSort,
        setPageIndex,
        setPageSize,
        clearSelection,
        selectAllVisible,
        triggerGeneralAction,
        triggerRowAction,
        confirmActiveAction,
        cancelActiveAction,
        exportState,
        refresh,
    } = useListCore<any, any>({
        ...(coreConfig as ListConfig<any, any>),
        idKey,
    });

    /* EFFECTIVE COMPONENTS (default or override) */

    const {
        Toolbar: ToolbarSlot,
        FiltersPanel: FiltersPanelSlot,
        SortBar: SortBarSlot,
        Table: TableSlot,
        Pagination: PaginationSlot,
        ModalOutlet: ModalOutletSlot,
        LoadingState: LoadingStateSlot,
        EmptyState: EmptyStateSlot,
        ErrorState: ErrorStateSlot,
    }: ListComponents = components ?? {};

    const compProps: ListComponentsProps = componentsProps ?? {};

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

    const handleChangeFilters = (next: unknown) => {
        const filters = (next ?? {}) as ActiveFilterState;
        setFilters(() => filters);
    };

    const handleChangeSort = (fieldId: string) => {
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
        } else {
            setSort({
                field: fieldId as any,
                direction: "asc",
            });
        }
    };

    const handlePageChange = (pageIndex: number) => {
        setPageIndex(pageIndex);
    };

    const handlePageSizeChange = (pageSize: number) => {
        setPageSize(pageSize);
    };

    const handleToolbarActionClick = (actionId: string) => {
        void triggerGeneralAction(actionId);
    };

    const handleRowActionClick = (actionId: string, rowIndex: number) => {
        void triggerRowAction(actionId, rowIndex);
    };

    const handleModalConfirm = (payload?: unknown) => {
        void confirmActiveAction(payload);
    };

    const handleModalCancel = () => {
        cancelActiveAction();
    };

    /* DERIVED STATE FOR UI */

    const isLoading =
        state.status === "loading" &&
        (!state.rows || state.rows.length === 0);

    const hasError = state.status === "error";
    const isEmpty =
        state.status === "ready" &&
        state.rows &&
        state.rows.length === 0;

    const loadingMessage = "Loading data...";
    const emptyMessage = "No data available.";
    const errorMessage = "An error occurred while loading data.";

    const snapshotForExport = useMemo(() => exportState(), [exportState]);
    void snapshotForExport; // to prevent linter warnings until it's actually used

    /* RENDER */

    return (
        <ListContainer className="ld-list">
            <ToolbarComponent
                {...(compProps.Toolbar as any)}
                state={state}
                generalActions={generalActions}
                onActionClick={handleToolbarActionClick}
            />

            <FiltersPanelComponent
                {...(compProps.FiltersPanel as any)}
                state={state}
                fields={fields}
                onChangeFilters={handleChangeFilters}
            />

            <SortBarComponent
                {...(compProps.SortBar as any)}
                state={state}
                fields={fields}
                onChangeSort={handleChangeSort}
            />

            {isLoading && (
                <LoadingStateComponent
                    {...(compProps.LoadingState as any)}
                    message={loadingMessage}
                />
            )}

            {hasError && !isLoading && (
                <ErrorStateComponent
                    {...(compProps.ErrorState as any)}
                    message={errorMessage}
                />
            )}

            {isEmpty && !isLoading && !hasError && (
                <EmptyStateComponent
                    {...(compProps.EmptyState as any)}
                    message={emptyMessage}
                />
            )}

            {!isLoading && !hasError && state.rows && state.rows.length > 0 && (
                <>
                    <TableComponent
                        {...(compProps.Table as any)}
                        state={state}
                        fields={fields}
                        idKey={idKey}
                        rowActions={rowActions}
                        onRowActionClick={handleRowActionClick}
                    />

                    <PaginationComponent
                        {...(compProps.Pagination as any)}
                        state={state}
                        onChangePage={handlePageChange}
                        onChangePageSize={handlePageSizeChange}
                    />
                </>
            )}

            <ModalOutletComponent
                {...(compProps.ModalOutlet as any)}
                state={state}
                generalActions={generalActions}
                rowActions={rowActions}
                onConfirm={handleModalConfirm}
                onCancel={handleModalCancel}
            />
        </ListContainer>
    );
};

export default ListDisplay;
