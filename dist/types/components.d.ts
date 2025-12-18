import type { ComponentType } from "react";
import type { ListState } from "./listState";
import type { GeneralAction, RowAction } from "./actions";
import type { FieldSchema } from "./fieldSchema";
/**
 * Props passed to the toolbar slot component. This surface focuses on
 * triggering list-level actions and therefore exposes the current list
 * state and the available general actions.
 *
 * @public
 */
export interface ToolbarProps {
    /**
     * Latest list state snapshot. Consumers can use this to render counters
     * or to derive disabled states for toolbar controls.
     */
    state: ListState<any>;
    /**
     * Collection of actions that apply to the whole list rather than a
     * specific row.
     */
    generalActions?: Array<GeneralAction<any, any>>;
    /**
     * Callback invoked when a toolbar action is selected.
     */
    onActionClick?: (actionId: string) => void;
}
/**
 * Props for the filters panel slot. This component is expected to surface
 * controls for adjusting the active filter set.
 *
 * @public
 */
export interface FiltersPanelProps {
    /**
     * Current list state including the active filters.
     */
    state: ListState<any>;
    /**
     * Definitions for the fields that support filtering.
     */
    fields: Array<FieldSchema<any>>;
    /**
     * Handler to update the filter bag. The consumer should pass the
     * next value that will be merged into the list state.
     */
    onChangeFilters?: (next: unknown) => void;
}
/**
 * Props for the sort bar slot. This surface exposes the fields that can be
 * sorted alongside a handler to update the current sort descriptor.
 *
 * @public
 */
export interface SortBarProps {
    /**
     * Current list state including the active sort descriptor.
     */
    state: ListState<any>;
    /**
     * Fields that can be sorted.
     */
    fields: Array<FieldSchema<any>>;
    /**
     * Handler invoked when the user selects a new field to sort by.
     */
    onChangeSort?: (fieldId: string) => void;
}
/**
 * Props for the table slot responsible for rendering the visible rows.
 *
 * @public
 */
export interface TableProps {
    /**
     * Current list state containing the rows to render.
     */
    state: ListState<any>;
    /**
     * Field schema definitions used to map row values to columns.
     */
    fields: Array<FieldSchema<any>>;
    /**
     * Identifier key to extract a stable row id from each record.
     */
    idKey: string;
    /**
     * Optional row-level actions.
     */
    rowActions?: Array<RowAction<any, any>>;
    /**
     * Callback fired when a row action is selected.
     */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
/**
 * Props for the pagination controls slot.
 *
 * @public
 */
export interface PaginationProps {
    /**
     * Current pagination state.
     */
    state: ListState<any>;
    /**
     * Handler to move to a different page index.
     */
    onChangePage?: (pageIndex: number) => void;
    /**
     * Handler to update the number of items displayed per page.
     */
    onChangePageSize?: (pageSize: number) => void;
}
/**
 * Props forwarded to the modal outlet slot which orchestrates confirmation
 * or custom modals associated with actions.
 *
 * @public
 */
export interface ModalOutletProps {
    /**
     * Current list state, including modal metadata.
     */
    state: ListState<any>;
    /**
     * General list actions that may open a modal.
     */
    generalActions?: Array<GeneralAction<any, any>>;
    /**
     * Row-specific actions that may open a modal.
     */
    rowActions?: Array<RowAction<any, any>>;
    /**
     * Callback when the active modal flow is confirmed.
     */
    onConfirm: (payload?: unknown) => void | Promise<void>;
    /**
     * Callback when the active modal flow is cancelled.
     */
    onCancel: () => void;
}
/**
 * Minimal props shared by the various status state components such as
 * loading, empty, or error states.
 *
 * @public
 */
export interface StatusStateProps {
    /**
     * Optional message to display alongside the visual state.
     */
    message?: string;
}
/**
 * Mapping of overridable UI components ("slots").
 * Relaxed typing here since you control any overrides.
 *
 * @public
 */
export interface ListComponents {
    /**
     * Toolbar slot component.
     */
    Toolbar?: ComponentType<any>;
    /**
     * Filters panel slot component.
     */
    FiltersPanel?: ComponentType<any>;
    /**
     * Sort bar slot component.
     */
    SortBar?: ComponentType<any>;
    /**
     * Table slot component responsible for rendering rows.
     */
    Table?: ComponentType<any>;
    /**
     * Pagination slot component.
     */
    Pagination?: ComponentType<any>;
    /**
     * Modal outlet slot component.
     */
    ModalOutlet?: ComponentType<any>;
    /**
     * Component displayed while data is loading.
     */
    LoadingState?: ComponentType<StatusStateProps>;
    /**
     * Component displayed when there are no rows.
     */
    EmptyState?: ComponentType<StatusStateProps>;
    /**
     * Component displayed when the list is in an error state.
     */
    ErrorState?: ComponentType<StatusStateProps>;
}
/**
 * Optional props bag for slot components keyed by the slot name. This allows
 * consumers to feed ad-hoc properties into overridden components while
 * keeping the core library agnostic of their shape.
 *
 * @public
 */
export type ListComponentsProps = Record<string, unknown>;
//# sourceMappingURL=components.d.ts.map