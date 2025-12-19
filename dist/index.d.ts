import React, { ReactNode, CSSProperties, ComponentType } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

/**
 * Operators supported by the filtering engine.
 *
 * @remarks
 * Includes comparison operators (equals, notEquals, gt, gte, lt, lte, between),
 * text operators (contains, startsWith, endsWith), and set operators (in).
 *
 * @public
 */
type FilterOperator = "equals" | "notEquals" | "contains" | "startsWith" | "endsWith" | "in" | "gt" | "gte" | "lt" | "lte" | "between";
/**
 * Logical filter types used to match operators and value shapes.
 *
 * @remarks
 * Determines which operators are available and how filter values are interpreted.
 * Custom types allow for specialized filtering logic.
 *
 * @public
 */
type FilterType = "text" | "select" | "multiSelect" | "number" | "date" | "boolean" | "custom";
/**
 * Option used by select-based filters.
 *
 * @remarks
 * Used by select and multiSelect filter types to provide predefined choices.
 *
 * @public
 */
interface FilterOption {
    /** Option value stored in the filter state. */
    value: string | number | boolean;
    /** Human-readable label presented to the user. */
    label: string;
}
/**
 * Per-field filter configuration.
 *
 * @remarks
 * Defines how a specific field should be filtered, including the filter type,
 * available operators, normalization logic, and predefined options.
 *
 * @public
 */
interface FieldFilterConfig<TRow = any, TValue = any> {
    /** The type of filter to use for this field. */
    type: FilterType;
    /** Optional list of operators to restrict for this field. If omitted, all operators for the type are available. */
    operators?: FilterOperator[];
    /**
     * Normalizes a raw value from the row into something that can be used
     * for generic filtering / searching.
     *
     * @remarks
     * Used to transform complex field values into filterable primitives.
     * For example, converting a date object to a timestamp or extracting
     * a nested property value.
     *
     * @param value - The raw field value from the row
     * @param row - The complete row object for context
     * @returns The normalized value suitable for filtering
     */
    normalize?: (value: TValue, row: TRow) => string | number | boolean | null;
    /**
     * Optional list of static options (for select / multiSelect).
     *
     * @remarks
     * When provided, these options will be presented to the user for selection.
     * Each option contains a value and a human-readable label.
     * {@link FilterOption}
     */
    options?: FilterOption[];
}
/**
 * Active filters at list level.
 * Keyed by field id (or custom logical id).
 *
 * @remarks
 * Maps field identifiers to their current filter values. The structure
 * of each value depends on the filter type and operator being used.
 *
 * @public
 */
type ActiveFilterState = Record<string, unknown>;

/**
 * Pagination metadata describing both the current paging parameters and the
 * total counts when known.
 *
 * @public
 */
interface PaginationState {
    /**
     * Zero-based index of the current page.
     *
     * @remarks
     * The first page is represented by index 0. This value is used to calculate
     * which subset of rows should be displayed when pagination is enabled.
     */
    pageIndex: number;
    /**
     * Number of items requested per page.
     *
     * @remarks
     * Defines how many rows should be displayed on each page. This value is used
     * together with {@link PaginationState.pageIndex} to determine the visible row range.
     */
    pageSize: number;
    /**
     * Optional total number of items available across all pages.
     *
     * @remarks
     * When provided, this value is used to calculate {@link PaginationState.totalPages}
     * and enable UI features like page count display or jump-to-page controls.
     * May be undefined when the total count is not yet known or not applicable.
     */
    totalItems?: number;
    /**
     * Optional total number of pages inferred from {@link PaginationState.totalItems} and {@link PaginationState.pageSize}.
     *
     * @remarks
     * Calculated as `Math.ceil(totalItems / pageSize)` when both values are available.
     * May be undefined when {@link PaginationState.totalItems} is not provided or when
     * the total page count cannot be determined.
     */
    totalPages?: number;
}

/**
 * Direction used when sorting rows.
 * - `"asc"` - Ascending order (A-Z, 0-9, oldest to newest)
 * - `"desc"` - Descending order (Z-A, 9-0, newest to oldest)
 * @public
 */
type SortDirection = "asc" | "desc";
/**
 * Describes the active sort configuration for the list.
 * Specifies which field to sort by and in which direction.
 * @public
 */
interface SortDescriptor<TRow = any> {
    /**
     * Field id used to extract the sortable value from a row.
     * Must be a valid key of the row type that can be converted to a string.
     */
    field: keyof TRow & string;
    /**
     * Direction in which rows should be ordered.
     * {@link SortDirection}
     */
    direction: SortDirection;
}

/**
 * Identifier type accepted by selection helpers. Can be either a string or numeric value used to uniquely identify rows.
 * @public
 */
type RowId = string | number;
/**
 * Available selection modes for the list component.
 * - `"none"`: No row selection allowed
 * - `"single"`: Only one row can be selected at a time
 * - `"multiple"`: Multiple rows can be selected simultaneously
 * @public
 */
type SelectionMode = "none" | "single" | "multiple";
/**
 * Tracks the current selection configuration and the ids that are selected.
 * @public
 */
interface SelectionState<TRowId = RowId> {
    /**
     * Current selection mode determining how rows can be selected.
     */
    mode: SelectionMode;
    /**
     * Array of identifiers for the currently selected rows.
     */
    selectedIds: TRowId[];
}

/**
 * Exported snapshot of the list, meant to be consumed by the parent
 * only on demand (not continuously controlled).
 *
 * @public
 */
interface ListSnapshot<TRow = any, TRowId = RowId> {
    /**
     * All rows currently known by the list (after data source + local mutations).
     */
    rowsAll: TRow[];
    /**
     * Rows currently visible (after filters, sort, pagination).
     */
    rowsVisible: TRow[];
    /**
     * The current active filter state, containing all applied filters.
     * {@link ActiveFilterState}
     */
    filters: ActiveFilterState;
    /**
     * The current sort configuration, if any sorting is applied.
     * {@link SortDescriptor}
     */
    sort?: SortDescriptor<TRow>;
    /**
     * The current pagination state, including page size and current page.
     * {@link PaginationState}
     */
    pagination: PaginationState;
    /**
     * The current row selection state, tracking which rows are selected.
     * {@link SelectionState}
     */
    selection: SelectionState<TRowId>;
}

/**
 * Base context object provided to all action handlers, containing the current list state and mutation methods.
 *
 * @public
 */
interface ActionContextBase<TRow = any, TRowId = string | number> {
    /**
     * All rows managed by the list (after data source + local mutations).
     */
    rows: TRow[];
    /**
     * Rows currently visible in the UI (after filters/sort/pagination).
     */
    visibleRows: TRow[];
    /**
     * The current row selection state, tracking which rows are selected.
     * {@link SelectionState}
     */
    selection: SelectionState<TRowId>;
    /**
     * The current active filter state, containing all applied filters.
     * {@link ActiveFilterState}
     */
    filters: ActiveFilterState;
    /**
     * The current sort configuration, if any sorting is applied.
     * {@link SortDescriptor}
     */
    sort?: SortDescriptor<TRow>;
    /**
     * The current pagination state, including page size and current page.
     * {@link PaginationState}
     */
    pagination: PaginationState;
    /**
     * Primary way for actions to mutate the list. Pass an updater function that receives the current rows and returns the new rows array.
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;
    /**
     * Export a full snapshot of the current list state.
     * {@link ListSnapshot}
     */
    exportState: () => ListSnapshot<TRow, TRowId>;
    /**
     * Optional hook to trigger a data source refresh.
     */
    refresh?: () => void | Promise<void>;
}
/**
 * Context object provided to general action handlers that are not tied to a specific row.
 * {@link ActionContextBase}
 * @public
 */
interface GeneralActionContext<TRow = any, TRowId = string | number> extends ActionContextBase<TRow, TRowId> {
}
/**
 * Context object provided to row-specific action handlers, including the specific row being operated on.
 * {@link ActionContextBase}
 * @public
 */
interface RowActionContext<TRow = any, TRowId = string | number> extends ActionContextBase<TRow, TRowId> {
    /**
     * The specific row this action is operating on.
     */
    row: TRow;
    /**
     * The index of this row in the rows array.
     */
    rowIndex: number;
}

/**
 * Configuration for the built-in confirmation modal used by actions that need
 * a simple yes/no flow.
 * @public
 */
interface ConfirmModalConfig {
    /** Discriminator indicating a confirm modal. */
    type: "confirm";
    /** Title displayed at the top of the modal. */
    title: string;
    /** Optional descriptive text rendered under the title. */
    description?: ReactNode;
    /** Label for the confirm button. Defaults are provided by the UI layer. */
    confirmLabel?: string;
    /** Label for the cancel button. Defaults are provided by the UI layer. */
    cancelLabel?: string;
}
/**
 * Context provided to a custom modal renderer.
 * Extends general context and optionally carries row info.
 * {@link GeneralActionContext}
 * @public
 */
interface CustomModalRenderContext<TRow = any, TRowId = string | number> extends GeneralActionContext<TRow, TRowId> {
    row?: TRow;
    rowIndex?: number;
    /**
     * Close the modal without necessarily performing the action.
     */
    close: () => void;
    /**
     * Complete the modal interaction and optionally pass a payload
     * to the action handler.
     */
    submit: (payload?: unknown) => void;
}
/**
 * Configuration for a user-supplied modal renderer, allowing bespoke flows
 * while still participating in the ListDisplay action lifecycle.
 * @public
 */
interface CustomModalConfig<TRow = any, TRowId = string | number> {
    /** Discriminator indicating a custom modal. */
    type: "custom";
    /**
     * Render function that returns any React node to display. The provided
     * context contains helpers to close or submit the modal.
     */
    render: (ctx: CustomModalRenderContext<TRow, TRowId>) => ReactNode;
}
/**
 * Union describing the supported modal configurations for actions.
 * {@link ConfirmModalConfig} | {@link CustomModalConfig}
 * @public
 */
type ModalConfig<TRow = any, TRowId = string | number> = ConfirmModalConfig | CustomModalConfig<TRow, TRowId>;

/**
 * Visual style variants available for list actions.
 *
 * @public
 */
type ActionKind = "default" | "primary" | "secondary" | "danger" | "ghost";
/**
 * Base interface for all list actions, defining common properties like label, icon, and modal configuration.
 *
 * @public
 */
interface ListActionBase<TRow = any, TRowId = string | number> {
    /**
     * Unique identifier for this action.
     */
    id: string;
    /**
     * Display label for the action.
     */
    label: string;
    /**
     * Optional icon element to display alongside the label.
     */
    icon?: ReactNode;
    /**
     * Visual style variant for the action button {@link ActionKind}.
     */
    kind?: ActionKind;
    /**
     * Whether this action conceptually owns a modal (confirm/custom).
     */
    opensModal?: boolean;
    /**
     * Modal configuration if the action requires one.
     */
    modal?: ModalConfig<TRow, TRowId>;
}
/**
 * Action that operates on the entire list or selected rows, not tied to a specific row.
 *
 * @public
 */
interface GeneralAction<TRow = any, TRowId = string | number> extends ListActionBase<TRow, TRowId> {
    /**
     * Whether a non-empty selection is required for this action.
     */
    requiresSelection?: boolean;
    /**
     * Handler executed when the action is triggered (after any modal interaction, if applicable).
     */
    handler?: (ctx: GeneralActionContext<TRow, TRowId>) => void | Promise<void>;
}
/**
 * Action that operates on a specific row in the list.
 *
 * @public
 */
interface RowAction<TRow = any, TRowId = string | number> extends ListActionBase<TRow, TRowId> {
    /**
     * Handler executed for a specific row.
     */
    handler?: (ctx: RowActionContext<TRow, TRowId>) => void | Promise<void>;
}

/**
 * Status values representing the lifecycle of the list data layer.
 * @internal
 */
type ListStatus = "idle" | "loading" | "ready" | "streaming" | "error";
/**
 * Tracks which action is currently active in the UI, optionally tied to a row.
 * @internal
 */
interface ActiveActionState {
    /**
     * Whether the active action targets the entire list or a single row.
     */
    type: "general" | "row";
    /**
     * Identifier of the action as defined in the configuration.
     */
    actionId: string;
    /**
     * Identifier of the row associated with the action, when applicable.
     */
    rowId?: RowId;
}
/**
 * State for the modal experience tied to actions.
 * @internal
 */
interface ModalState {
    /**
     * Whether a modal is currently shown.
     */
    isOpen: boolean;
    /**
     * Identifier of the action owning the modal.
     */
    actionId?: string;
    /**
     * Identifier of the row associated with the modal, if any.
     */
    rowId?: RowId;
}
/**
 * UI-specific state (separate from data state), managing active actions and modal visibility.
 * @internal
 */
interface ListUiState {
    /**
     * The currently active action in the UI, if any.
     * {@link ActiveActionState}
     */
    activeAction?: ActiveActionState;
    /**
     * The current modal state, if a modal is open or configured.
     * {@link ModalState}
     */
    modal?: ModalState;
}

/**
 * Full internal state of the list, containing all data and UI state required for rendering and manipulation.
 * @internal
 */
interface ListState<TRow = any> {
    /**
     * Raw rows as maintained from the data source + local mutations.
     */
    rawRows: TRow[];
    /**
     * Rows actually used for rendering after filters/sort/pagination.
     */
    rows: TRow[];
    /**
     * The current active filter state, containing all applied filters.
     * {@link ActiveFilterState}
     */
    filters: ActiveFilterState;
    /**
     * The current sort configuration, if any sorting is applied.
     * {@link SortDescriptor}
     */
    sort?: SortDescriptor<TRow>;
    /**
     * The current pagination state, including page size and current page.
     * {@link PaginationState}
     */
    pagination: PaginationState;
    /**
     * The current row selection state, tracking which rows are selected.
     * {@link SelectionState}
     */
    selection: SelectionState;
    /**
     * The current operational status of the list (idle, loading, error, etc.).
     */
    status: ListStatus;
    /**
     * Error information if the list is in an error state.
     */
    error?: unknown;
    /**
     * UI-specific state such as which filters are visible or expanded.
     * {@link ListUiState}
     */
    ui: ListUiState;
}

/**
 * Text alignment options for field cells and headers.
 * @public
 */
type FieldAlign = "left" | "center" | "right";
/**
 * Context object passed to custom cell renderers.
 * @public
 */
interface CellRenderContext<TRow = any> {
    /**
     * The index of the row in the visible rows array.
     */
    rowIndex: number;
    /**
     * Whether the row is currently selected.
     */
    isSelected: boolean;
}
/**
 * Column/field definition for the list, describing how a field should be displayed and behave.
 * @public
 */
interface FieldSchema<TRow = any, TValue = any> {
    /**
     * Property name on the row object. Must be a valid key of the row type.
     */
    id: keyof TRow & string;
    /**
     * Label shown in the header column.
     */
    label: string;
    /**
     * Whether the column can be sorted. When true, enables sort interaction on the column header.
     */
    sortable?: boolean;
    /**
     * Filter configuration for this column, enabling filtering capabilities.
     * {@link FieldFilterConfig}
     */
    filter?: FieldFilterConfig<TRow, TValue>;
    /**
     * Preferred width for the column (can be pixels, percentage, or other CSS units).
     */
    width?: number | string;
    /**
     * Minimum width for the column (can be pixels, percentage, or other CSS units).
     */
    minWidth?: number | string;
    /**
     * Text and cell content alignment.
     * {@link FieldAlign}
     */
    align?: FieldAlign;
    /**
     * Optional custom renderer for the cell content. Receives the row, extracted value, and render context.
     * {@link CellRenderContext}
     */
    cellRenderer?: (row: TRow, value: TValue, ctx: CellRenderContext<TRow>) => ReactNode;
    /**
     * Dynamic style function for the cell, allowing conditional styling based on row data and value.
     */
    cellStyle?: (row: TRow, value: TValue) => CSSProperties;
    /**
     * Optional static style object for the header cell.
     */
    headerStyle?: CSSProperties;
}

/**
 * Props passed to the toolbar slot component. This surface focuses on
 * triggering list-level actions and therefore exposes the current list
 * state and the available general actions.
 *
 * @public
 */
interface ToolbarProps {
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
interface FiltersPanelProps {
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
interface SortBarProps {
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
interface TableProps {
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
interface PaginationProps {
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
interface ModalOutletProps {
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
interface StatusStateProps {
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
interface ListComponents {
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
type ListComponentsProps = Record<string, unknown>;

/**
 * Defines the kind of data source being used.
 * - `static`: Fixed data provided once at initialization
 * - `stream`: Real-time data that can push updates incrementally
 * - `query`: Data fetched from a query-based source (e.g., REST API, GraphQL)
 *
 * @public
 */
type DataSourceKind = "static" | "stream" | "query";
/**
 * Result object returned by the data source's initial load operation.
 *
 * @public
 */
interface DataSourceInitResult<TRow = any> {
    /**
     * The initial rows loaded from the data source.
     */
    rows: TRow[];
    /**
     * Optional total count of all rows available (useful for server-side pagination).
     */
    totalCount?: number;
    /**
     * Optional status indicator for the list state.
     */
    status?: ListStatus;
}
/**
 * Discriminated union representing incremental data updates that can be applied to the list.
 * - `replaceAll`: Replace all rows with a new set
 * - `append`: Add a single new row
 * - `update`: Update an existing row
 * - `remove`: Remove a row by ID
 *
 * @public
 */
type DataPatch<TRow = any, TRowId = RowId> = {
    type: "replaceAll";
    rows: TRow[];
} | {
    type: "append";
    row: TRow;
} | {
    type: "update";
    row: TRow;
} | {
    type: "remove";
    id: TRowId;
};
/**
 * Callback function invoked when a data patch is received from the data source.
 * {@link DataPatch}
 *
 * @public
 */
type DataPatchListener<TRow = any, TRowId = RowId> = (patch: DataPatch<TRow, TRowId>) => void;
/**
 * Function returned by subscribe() that can be called to unsubscribe from data updates.
 *
 * @public
 */
type Unsubscribe = () => void;
/**
 * Metadata describing a data source's characteristics.
 *
 * @public
 */
interface DataSourceMeta {
    /**
     * The kind of data source.
     * {@link DataSourceKind}
     */
    kind: DataSourceKind;
    /**
     * Optional human-readable label for the data source.
     */
    label?: string;
}
/**
 * Generic, technology-agnostic data source contract.
 * Wraps parent-provided data, streams, queries etc. This interface abstracts
 * away the underlying data fetching mechanism, allowing the list component to work
 * with static data, real-time streams, REST APIs, GraphQL queries, and more.
 *
 * @public
 */
interface DataSource<TRow = any, TRowId = RowId> {
    /**
     * Metadata describing this data source.
     * {@link DataSourceMeta}
     */
    meta: DataSourceMeta;
    /**
     * Initial load. Must resolve with at least the initial rows.
     * {@link DataSourceInitResult}
     */
    init: () => Promise<DataSourceInitResult<TRow>>;
    /**
     * Optional stream of patches for incremental updates. Subscribe to receive real-time
     * data changes via {@link DataPatch} objects.
     * {@link DataPatchListener}
     * {@link Unsubscribe}
     */
    subscribe?: (listener: DataPatchListener<TRow, TRowId>) => Unsubscribe;
    /**
     * Optional refresh hook to manually trigger a data reload or refetch.
     */
    refresh?: () => Promise<void> | void;
    /**
     * Optional cleanup hook called when the data source is no longer needed.
     * Use this to unsubscribe from streams, close connections, or release resources.
     */
    destroy?: () => void;
}

/**
 * Public configuration accepted by ListDisplay component.
 *
 * @remarks
 * This interface defines all configuration options for creating a ListDisplay instance,
 * including data source, field definitions, actions, filtering, sorting, pagination,
 * selection behavior, and UI component customization.
 *
 * @public
 */
interface ListConfig<TRow = any, TRowId = RowId> {
    /**
     * Data source adapter that provides and manages the list data.
     *
     * @remarks
     * The data source is responsible for loading, filtering, sorting, and paginating data.
     * It must implement the {@link DataSource} interface.
     */
    dataSource: DataSource<TRow, TRowId>;
    /**
     * Column definitions that specify which fields to display and how to render them.
     *
     * @remarks
     * Each field schema defines a column in the list, including its accessor, label,
     * rendering behavior, and whether it supports filtering or sorting.
     * {@link FieldSchema}
     */
    fields: Array<FieldSchema<TRow>>;
    /**
     * Property name on TRow that serves as the unique identifier for each row.
     *
     * @remarks
     * This key is used for row selection, tracking, and uniquely identifying rows
     * in operations like updates and deletions.
     */
    idKey: keyof TRow & string;
    /**
     * General (toolbar-level) actions that operate on the entire list or selected rows.
     *
     * @remarks
     * These actions typically appear in the list toolbar and can operate on the current
     * selection or the entire dataset. Examples include bulk delete, export, or refresh.
     * {@link GeneralAction}
     */
    generalActions?: Array<GeneralAction<TRow, TRowId>>;
    /**
     * Row-level actions that operate on individual rows.
     *
     * @remarks
     * These actions are associated with specific rows and typically appear as buttons
     * or menu items in each row. Examples include edit, delete, or view details.
     * {@link RowAction}
     */
    rowActions?: Array<RowAction<TRow, TRowId>>;
    /**
     * Initial filters to apply when the list is first rendered.
     *
     * @remarks
     * Specifies the initial state of active filters. Users can modify these filters
     * through the UI, and the list will update accordingly.
     * {@link ActiveFilterState}
     */
    initialFilters?: ActiveFilterState;
    /**
     * Initial sort configuration to apply when the list is first rendered.
     *
     * @remarks
     * Defines which field to sort by and the sort direction (ascending or descending).
     * Users can change the sort order through the UI.
     * {@link SortDescriptor}
     */
    initialSort?: SortDescriptor<TRow>;
    /**
     * Initial pagination state including page size and starting page.
     *
     * @remarks
     * Specifies the initial page number and number of rows per page. Users can navigate
     * through pages and change the page size through the UI.
     * {@link PaginationState}
     */
    initialPagination?: PaginationState;
    /**
     * Selection mode that determines how rows can be selected in the list.
     *
     * @remarks
     * Controls whether users can select no rows, a single row, or multiple rows.
     * This affects the rendering of selection UI elements like checkboxes or radio buttons.
     */
    selectionMode?: SelectionMode;
    /**
     * Overridable UI components (slots) for customizing the list appearance.
     *
     * @remarks
     * Allows replacement of default UI components with custom implementations
     * for various parts of the list, such as the toolbar, filters, pagination controls, etc.
     * {@link ListComponents}
     */
    components?: ListComponents;
    /**
     * Optional props passed to slot components for additional customization.
     *
     * @remarks
     * Provides a way to pass additional configuration or props to the custom
     * components specified in the components property.
     * {@link ListComponentsProps}
     */
    componentsProps?: ListComponentsProps;
}

/**
 * List body component module.
 *
 * @remarks
 * This module contains the ListBody component responsible for rendering
 * the tbody element of a list table, including rows and empty state handling.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Props for the ListBody component.
 *
 * @internal
 */
interface ListBodyProps {
    /** The current state of the list including rows and metadata */
    state: ListState<any>;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The key used to uniquely identify each row */
    idKey: string;
    /** Optional array of actions available for each row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
/**
 * Renders the body section of a list table.
 *
 * @remarks
 * This component renders the tbody element containing all data rows or an empty state
 * when no data is available. It delegates individual row rendering to the ListRow component.
 *
 * @param props - The component props
 * @returns A tbody element with rows or empty state
 *
 * @internal
 */
declare const ListBody: React.FC<ListBodyProps>;

/**
 * List cell component module.
 *
 * @remarks
 * This module contains the ListCell component responsible for rendering
 * individual table cells within a list row, including custom rendering and styling.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Props for the ListCell component.
 *
 * @internal
 */
interface ListCellProps {
    /** The data object for the current row */
    row: any;
    /** The zero-based index of the row in the list */
    rowIndex: number;
    /** The field schema defining how to render this cell */
    field: FieldSchema<any>;
    /** Whether the row containing this cell is currently selected */
    isSelected: boolean;
}
/**
 * Renders an individual cell within a list table row.
 *
 * @remarks
 * This component handles cell rendering with support for custom renderers,
 * custom styling, and selection state. It applies the field's cellRenderer
 * if provided, otherwise displays the raw field value.
 *
 * @param props - The component props
 * @returns A td element containing the rendered cell content
 *
 * @internal
 */
declare const ListCell: React.FC<ListCellProps>;

/**
 * List container component module.
 *
 * @remarks
 * This module contains the ListContainer component responsible for providing
 * the root container wrapper for list layout structures.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Props for the ListContainer component.
 *
 * @internal
 */
interface ListContainerProps {
    /** Optional CSS class name to override default container styling */
    className?: string;
    /** Child elements to be rendered within the container */
    children?: React.ReactNode;
}
/**
 * Renders the root container for list layout structures.
 *
 * @remarks
 * This component provides a wrapper div element that serves as the outermost
 * container for list components. It applies a default "ld-list" class name
 * unless a custom className is provided via props.
 *
 * @param props - The component props
 * @returns A div element wrapping the list content
 *
 * @internal
 */
declare const ListContainer: React.FC<ListContainerProps>;

/**
 * List filters panel component module.
 *
 * @remarks
 * This module contains the ListFiltersPanel component responsible for rendering
 * a placeholder filters panel with reset functionality. It displays a message
 * prompting users to provide a custom FiltersPanel via slots.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders a placeholder filters panel for list views.
 *
 * @remarks
 * This component provides a minimal filters panel UI that displays a placeholder
 * message when no custom filters panel is configured. It includes a reset button
 * to clear all active filters and is disabled during loading states.
 *
 * @param props - The component props conforming to FiltersPanelProps interface
 * @returns A filters panel element or null if onChangeFilters is not provided or no fields exist
 *
 * @internal
 */
declare const ListFiltersPanel: React.FC<FiltersPanelProps>;

/**
 * Props for the ListHeader component.
 *
 * @internal
 */
interface ListHeaderProps<TRow = any> {
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<TRow>>;
    /** Whether the list has row actions, which requires an additional action column header */
    hasRowActions: boolean;
}
/**
 * Renders the header section of a list table.
 *
 * @remarks
 * This component renders the thead element containing column headers based on field schemas.
 * If row actions are present, an additional empty header cell is rendered for the actions column.
 *
 * @param props - The component props
 * @returns A thead element with header row and cells
 *
 * @internal
 */
declare const ListHeader: <TRow = any>({ fields, hasRowActions, }: ListHeaderProps<TRow>) => react_jsx_runtime.JSX.Element;

/**
 * List pagination component module.
 *
 * @remarks
 * This module contains the ListPagination component responsible for rendering
 * pagination controls including page navigation, page size selection, and display
 * of current pagination state information.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders pagination controls for navigating through list pages.
 *
 * @remarks
 * This component provides a complete pagination UI including:
 * - Current page and total pages display
 * - Total items count
 * - Previous/Next navigation buttons with disabled states
 * - Page size selector dropdown with preset options (10, 25, 50, 100)
 *
 * The component uses the pagination state from the provided ListState and
 * triggers callbacks when users interact with page navigation or page size controls.
 *
 * @param props - The component props
 * @returns A div element containing pagination information and controls
 *
 * @internal
 */
declare const ListPagination: React.FC<PaginationProps>;

/**
 * List row component module.
 *
 * @remarks
 * This module contains the ListRow component responsible for rendering
 * individual table rows within a list, including cell rendering, selection state,
 * and row-level actions.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Props for the ListRow component.
 *
 * @internal
 */
interface ListRowProps {
    /** The data object for the current row */
    row: any;
    /** The zero-based index of the row in the list */
    rowIndex: number;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The current state of the list including selection and metadata */
    state: ListState<any>;
    /** The key used to uniquely identify this row */
    idKey: string;
    /** Optional array of actions available for this row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
/**
 * Renders an individual row within a list table.
 *
 * @remarks
 * This component renders a tr element containing cells for each field and optional
 * row actions. It handles row selection state and applies appropriate styling classes.
 * Each cell is rendered using the ListCell component, and row actions are rendered
 * as buttons within a dedicated actions cell.
 *
 * @param props - The component props
 * @returns A tr element containing cells and optional action buttons
 *
 * @internal
 */
declare const ListRow: React.FC<ListRowProps>;

/**
 * List sort bar component module.
 *
 * @remarks
 * This module contains the ListSortBar component responsible for rendering
 * a sort control interface with a dropdown for selecting sortable fields
 * and a toggle button for changing sort direction.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders a sort control bar for list tables.
 *
 * @remarks
 * This component provides a minimal sort interface with a dropdown to select
 * sortable fields and a direction toggle button. It only renders if the onChangeSort
 * callback is provided and there are sortable fields available. The component
 * automatically filters fields to show only those marked as sortable.
 *
 * @param props - The component props
 * @returns A sort bar with field selector and direction toggle, or null if sorting is not available
 *
 * @internal
 */
declare const ListSortBar: React.FC<SortBarProps>;

/**
 * List table component module.
 *
 * @remarks
 * This module contains the ListTable component responsible for rendering
 * the main table structure of a list, including the table wrapper, header, and body.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders the main table structure for a list view.
 *
 * @remarks
 * This component serves as the default table layout, wrapping the table structure
 * and coordinating the rendering of the header and body sections. It automatically
 * determines if row actions should be displayed based on the provided rowActions prop.
 *
 * @param props - The component props conforming to TableProps interface
 * @returns A div wrapper containing the complete table structure
 *
 * @internal
 */
declare const ListTable: React.FC<TableProps>;

/**
 * List toolbar component module.
 *
 * @remarks
 * This module contains the ListToolbar component responsible for rendering
 * a toolbar with general action buttons for list operations.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders a toolbar with general action buttons for list operations.
 *
 * @remarks
 * This component displays a horizontal toolbar containing action buttons based on
 * the provided generalActions array. Each action is rendered as a button with optional
 * icon and label. Buttons are disabled during loading or streaming states.
 * Returns null if no general actions are provided.
 *
 * @param props - The component props conforming to ToolbarProps interface
 * @returns A toolbar div element with action buttons, or null if no actions are provided
 *
 * @internal
 */
declare const ListToolbar: React.FC<ToolbarProps>;

/**
 * Confirm modal component module.
 *
 * @remarks
 * This module contains the ConfirmModal component and related props interface
 * for displaying confirmation dialogs with customizable content and actions.
 *
 * @packageDocumentation
 * @public
 */

/**
 * Props for the ConfirmModal component.
 *
 * @public
 */
interface ConfirmModalProps {
    /** The title text displayed in the modal header */
    title: string;
    /** Optional description content displayed in the modal body, can be a string or React node */
    description?: React.ReactNode;
    /** Optional label for the confirm button, defaults to "Confirm" */
    confirmLabel?: string;
    /** Optional label for the cancel button, defaults to "Cancel" */
    cancelLabel?: string;
    /** Callback function triggered when the confirm button is clicked, can be synchronous or asynchronous */
    onConfirm: () => void | Promise<void>;
    /** Callback function triggered when the cancel button is clicked */
    onCancel: () => void;
}
/**
 * Renders a confirmation modal dialog with customizable content and actions.
 *
 * @remarks
 * This component provides a very small, unstyled confirm modal.
 * Styling is left to consumer via CSS classes. The modal includes a header,
 * optional body content, and footer with cancel and confirm action buttons.
 *
 * @param props - The component props
 * @returns A modal dialog element with backdrop
 *
 * @public
 */
declare const ConfirmModal: React.FC<ConfirmModalProps>;

/**
 * List modal outlet component module.
 *
 * @remarks
 * This module contains the ListModalOutlet component which provides default modal rendering
 * functionality for list actions. It supports confirm modals out of the box and provides
 * fallback handling for custom modals that require consumer implementation.
 *
 * @packageDocumentation
 * @public
 */

/**
 * Default modal outlet component for rendering action-triggered modals.
 *
 * @remarks
 * This component provides default modal rendering functionality for list actions.
 * It supports:
 * - Confirm modals (ModalConfig.type === "confirm") with customizable titles, descriptions, and button labels
 * - Fallback handling for missing action configurations
 * - Custom modal placeholders with instructions for consumer implementation
 *
 * For custom modals (ModalConfig.type === "custom"), consumers are expected to override
 * this component via the "ModalOutlet" slot in the list configuration and handle rendering themselves.
 *
 * @param props - The component props containing state, actions, and callbacks {@link ModalOutletProps}
 * @returns A modal component based on the active action configuration, or null if no modal is open
 *
 * @public
 */
declare const ListModalOutlet: React.FC<ModalOutletProps>;

/**
 * List empty state component module.
 *
 * @remarks
 * This module contains the ListEmptyState component responsible for rendering
 * an empty state message when a list has no data to display.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders an empty state message for lists with no data.
 *
 * @remarks
 * This component displays a centered message indicating that there is no data
 * to display in the list. It uses a default message if none is provided via props.
 *
 * @param props - The component props
 * @returns A div element containing the empty state message
 *
 * @internal
 */
declare const ListEmptyState: React.FC<StatusStateProps>;

/**
 * List error state component module.
 *
 * @remarks
 * This module contains the ListErrorState component responsible for rendering
 * an error state display when list data fails to load or encounters an error.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders an error state display for list components.
 *
 * @remarks
 * This component displays an error message when data loading fails.
 * If no custom message is provided, a default error message is shown.
 *
 * @param props - The component props
 * @returns A div element containing the error state display
 *
 * @internal
 */
declare const ListErrorState: React.FC<StatusStateProps>;

/**
 * List loading state component module.
 *
 * @remarks
 * This module contains the ListLoadingState component responsible for rendering
 * a loading indicator with an optional message while data is being fetched.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Renders a loading state indicator for lists.
 *
 * @remarks
 * This component displays a spinner animation along with a customizable message
 * to inform users that data is being loaded. The message defaults to "Loading data..."
 * if not provided.
 *
 * @param props - The component props
 * @returns A div element containing a spinner and loading message
 *
 * @internal
 */
declare const ListLoadingState: React.FC<StatusStateProps>;

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
type ListDisplayProps = ListConfig<any, any>;
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
declare const ListDisplay: React.FC<ListDisplayProps>;

/**
 * Core filtering module providing predicate building and filter application for list data.
 *
 * @packageDocumentation
 * @internal
 */

/**
 * Type alias for any row object.
 * @internal
 */
type AnyRow$3 = any;
/**
 * Context object containing filter state and field schemas needed for filter evaluation.
 *
 * @typeParam TRow - The type of row objects being filtered
 * @internal
 */
interface FilterContext<TRow = AnyRow$3> {
    /**
     * The current active filter state containing all applied filters.
     */
    filters: ActiveFilterState;
    /**
     * Array of field schemas that define the structure and filter configuration for each field.
     */
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Builds a predicate function that evaluates whether a row passes all active filters.
 * The predicate performs AND logic across all filters (row must match all filters).
 * Returns a no-op predicate if no filters are active.
 *
 * @typeParam TRow - The type of row objects
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A predicate function that returns true if the row passes all filters
 * @internal
 */
declare const buildFilterPredicate: <TRow = AnyRow$3>(ctx: FilterContext<TRow>) => ((row: TRow) => boolean);
/**
 * Applies all active filters to a list of rows and returns the filtered array.
 * This is the primary entry point for filter evaluation.
 *
 * @typeParam TRow - The type of row objects
 * @param rows - The array of rows to filter
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A new array containing only rows that pass all filters
 * @internal
 */
declare const applyFilters: <TRow = AnyRow$3>(rows: TRow[], ctx: FilterContext<TRow>) => TRow[];

type AnyRow$2 = any;
/**
 * Recomputes pagination metadata based on the current rows.
 *
 * Ensures that page indices remain valid and recalculates total pages
 * when the row count or page size changes.
 *
 * @param pagination - The current pagination state
 * @param totalItems - The total number of items in the dataset
 * @returns Updated pagination state with corrected indices and metadata
 *
 * @internal
 */
declare const updatePaginationMeta: (pagination: PaginationState, totalItems: number) => PaginationState;
/**
 * Slices the rows according to the pagination state.
 *
 * Extracts the subset of rows that should be displayed on the current page.
 * If pageSize is 0 or negative, returns all rows without pagination.
 *
 * @typeParam TRow - The type of row objects in the array
 * @param rows - The complete array of rows to paginate
 * @param pagination - The pagination state containing page index and size
 * @returns A slice of rows for the current page
 *
 * @internal
 */
declare const applyPagination: <TRow = AnyRow$2>(rows: TRow[], pagination: PaginationState) => TRow[];

type AnyRow$1 = any;
/**
 * Configuration context for selection operations, defining how selection behaves and how to identify rows.
 * @internal
 */
interface SelectionContext<TRow = AnyRow$1, TRowId extends RowId = RowId> {
    /**
     * The selection mode determining whether no rows, a single row, or multiple rows can be selected.
     */
    mode: SelectionMode;
    /**
     * The property key used to uniquely identify rows.
     */
    idKey: keyof TRow & string;
}
/**
 * Initializes a selection state.
 * @param mode - The selection mode to use; defaults to "none"
 * @returns A new selection state with no rows selected
 * @internal
 */
declare const createSelectionState: (mode?: SelectionMode) => SelectionState;
/**
 * Checks whether a specific row is currently selected.
 * @param row - The row to check
 * @param selection - The current selection state
 * @param ctx - The selection context containing the ID key
 * @returns True if the row is selected, false otherwise
 * @internal
 */
declare const isRowSelected: <TRow = AnyRow$1, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => boolean;
/**
 * Toggles the selection state of a specific row.
 *
 * Behavior varies by selection mode:
 * - "none": Returns unchanged selection state
 * - "single": Selects the row if not selected, deselects if already selected
 * - "multiple": Adds the row to selection if not selected, removes if already selected
 *
 * @param row - The row to toggle selection for
 * @param selection - The current selection state
 * @param ctx - The selection context containing mode and ID key
 * @returns A new selection state with the row's selection toggled
 * @internal
 */
declare const toggleRowSelection: <TRow = AnyRow$1, TRowId extends RowId = RowId>(row: TRow, selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;
/**
 * Clears all selected rows, returning a selection state with an empty selection.
 * @param selection - The current selection state
 * @returns A new selection state with no rows selected
 * @internal
 */
declare const clearSelection: <TRowId extends RowId = RowId>(selection: SelectionState<TRowId>) => SelectionState<TRowId>;
/**
 * Selects all visible rows according to the current selection mode.
 *
 * Behavior varies by selection mode:
 * - "none": Returns unchanged selection state
 * - "single": Selects only the first visible row
 * - "multiple": Selects all visible rows
 *
 * @param visibleRows - The array of currently visible rows to select
 * @param selection - The current selection state
 * @param ctx - The selection context containing mode and ID key
 * @returns A new selection state with all visible rows selected (according to mode)
 * @internal
 */
declare const selectAllVisible: <TRow = AnyRow$1, TRowId extends RowId = RowId>(visibleRows: TRow[], selection: SelectionState<TRowId>, ctx: SelectionContext<TRow, TRowId>) => SelectionState<TRowId>;

/**
 * Builds an immutable snapshot of the current list state.
 *
 * This function creates a deep copy of all state properties to ensure the snapshot
 * is immutable and safe to store or compare against future states.
 *
 * @typeParam TRow - The type of row data managed by the list. Defaults to `any`.
 * @typeParam TRowId - The type used for row identifiers. Must extend {@link RowId}. Defaults to `RowId`.
 *
 * @param state - The current list state to snapshot. {@link ListState}
 * @returns An immutable snapshot containing copies of all state data. {@link ListSnapshot}
 *
 * @internal
 */
declare const buildSnapshot: <TRow = any, TRowId extends RowId = RowId>(state: ListState<TRow>) => ListSnapshot<TRow, TRowId>;

type AnyRow = any;
/**
 * Context object containing sorting configuration and field metadata for list operations.
 *
 * @internal
 */
interface SortingContext<TRow = AnyRow> {
    /**
     * Optional sort descriptor specifying the field and direction to sort by.
     */
    sort?: SortDescriptor<TRow>;
    /**
     * Array of field schemas defining the structure of rows in the list.
     */
    fields: Array<FieldSchema<TRow>>;
}
/**
 * Applies sorting to a list of rows based on the provided sorting context.
 * Returns a new sorted array without mutating the original.
 *
 * @param rows - Array of rows to sort
 * @param ctx - Sorting context containing sort descriptor and field schemas
 * @returns New array with rows sorted according to the sort descriptor, or original array if no sort is specified
 *
 * @internal
 */
declare const applySorting: <TRow = AnyRow>(rows: TRow[], ctx: SortingContext<TRow>) => TRow[];

/**
 * Creates the initial UI state for a list component with no active actions
 * or open modals.
 *
 * @returns A fresh {@link ListUiState} instance with default values.
 * @internal
 */
declare const createInitialUiState: () => ListUiState;
/**
 * Opens a modal for a specific action by updating the UI state to mark both
 * the active action and the modal state as open.
 *
 * @param prev - The previous UI state to update.
 * @param actionId - Unique identifier of the action triggering the modal.
 * @param type - Whether the action is "general" (list-level) or "row" (row-specific).
 * @param rowId - Optional row identifier, required when type is "row".
 * @returns Updated {@link ListUiState} with the modal open and action metadata set.
 * @internal
 */
declare const openModalForAction: (prev: ListUiState, actionId: string, type: "general" | "row", rowId?: RowId) => ListUiState;
/**
 * Closes the currently open modal by resetting the modal state while
 * preserving the rest of the UI state.
 *
 * @param prev - The previous UI state to update.
 * @returns Updated {@link ListUiState} with the modal closed.
 * @internal
 */
declare const closeModal: (prev: ListUiState) => ListUiState;
/**
 * Clears the active action metadata from the UI state, typically called
 * after an action has been completed or cancelled.
 *
 * @param prev - The previous UI state to update.
 * @returns Updated {@link ListUiState} with no active action.
 * @internal
 */
declare const clearActiveAction: (prev: ListUiState) => ListUiState;

/**
 * Core hook module that encapsulates the data-management logic for ListDisplay.
 * This module provides the main `useListCore` hook which wires a data source,
 * schema metadata, and optional actions into a cohesive state machine that can
 * be consumed by UI components.
 *
 * @internal
 */

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
interface UseListCoreResult<TRow = any, TRowId extends RowId = RowId> {
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
declare const useListCore: <TRow = any, TRowId extends RowId = RowId>(config: ListConfig<TRow, TRowId>) => UseListCoreResult<TRow, TRowId>;

/**
 * Query-based data source module.
 *
 * @remarks
 * This module provides functionality for creating query-based data sources that support
 * single-shot data loading and optional refresh operations. It is designed to work with
 * various data fetching mechanisms such as fetch API, RTKQ, or other async data providers.
 *
 * @packageDocumentation
 * @public
 */

/**
 * Result object returned by a query load function.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 *
 * @public
 */
interface QueryResult<TRow = any> {
    /** Array of row objects returned by the query */
    rows: TRow[];
    /** Optional total count of all available rows (for pagination) */
    totalCount?: number;
}
/**
 * Function type for loading data from a query source.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 * @returns A promise or synchronous result containing rows and optional total count
 *
 * @public
 */
type QueryLoadFn<TRow = any> = () => Promise<QueryResult<TRow>> | QueryResult<TRow>;
/**
 * Configuration options for creating a query-based data source.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 *
 * @public
 */
interface QuerySourceOptions<TRow = any> {
    /**
     * Function that performs the actual data load (fetch/RTKQ/etc.).
     */
    load: QueryLoadFn<TRow>;
    /**
     * Optional label for debugging / devtools.
     */
    label?: string;
}
/**
 * Creates a query-based data source with single-shot load and optional refresh capability.
 *
 * @remarks
 * This function creates a DataSource implementation that loads data using a provided
 * query function. The data source supports initialization and refresh operations,
 * making it suitable for list views that need to fetch and reload data.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 * @typeParam TRowId - The type used for row identifiers (extends RowId)
 *
 * @param options - Configuration options for the query source
 * @returns A DataSource object with query-based loading capabilities
 *
 * @example
 * ```typescript
 * const userSource = createQuerySource({
 *   load: async () => {
 *     const response = await fetch('/api/users');
 *     const data = await response.json();
 *     return { rows: data.users, totalCount: data.total };
 *   },
 *   label: 'User List'
 * });
 * ```
 *
 * @public
 */
declare const createQuerySource: <TRow = any, TRowId extends RowId = RowId>(options: QuerySourceOptions<TRow>) => DataSource<TRow, TRowId>;

/**
 * Configuration options for creating a static data source.
 *
 * @public
 */
interface StaticSourceOptions<TRow = any> {
    /**
     * Initial set of rows to be returned by the data source.
     *
     * @defaultValue `[]`
     */
    initialRows?: TRow[];
    /**
     * Optional function to lazily provide rows (e.g., computed or derived data).
     * If provided, this takes precedence over `initialRows`.
     */
    getRows?: () => TRow[];
}
/**
 * Creates a simple, static data source that returns an initial snapshot of rows without streaming updates or patches.
 *
 * @remarks
 * This data source is ideal for static lists where data does not change after initialization.
 * It provides all rows upfront during the `init` call and does not support real-time updates.
 *
 * @typeParam TRow - The type of row objects in the data source
 * @typeParam TRowId - The type of row identifiers (defaults to RowId)
 *
 * @param options - Configuration options for the static data source
 *
 * @returns A DataSource instance configured with the provided static data
 *
 * @public
 */
declare const createStaticSource: <TRow = any, TRowId extends RowId = RowId>(options?: StaticSourceOptions<TRow>) => DataSource<TRow, TRowId>;

/**
 * Result object returned by the bootstrap function of a streaming data source.
 * Contains optional initial data and metadata for the stream.
 *
 * @public
 */
interface StreamBootstrapResult<TRow = any> {
    /**
     * Optional initial snapshot loaded when the list mounts.
     */
    initialRows?: TRow[];
    /**
     * Optional total count if known.
     */
    totalCount?: number;
}
/**
 * Function type for subscribing to streaming data updates.
 * Receives a patch listener and returns an optional unsubscribe function.
 *
 * @public
 */
type StreamSubscribeFn<TRow = any, TRowId extends RowId = RowId> = (listener: DataPatchListener<TRow, TRowId>) => Unsubscribe | void;
/**
 * Configuration options for creating a streaming data source.
 * Defines how to bootstrap, subscribe to, refresh, and destroy a streaming connection.
 *
 * @public
 */
interface StreamSourceOptions<TRow = any, TRowId extends RowId = RowId> {
    /**
     * Optional bootstrap function to get an initial snapshot.
     */
    bootstrap?: () => Promise<StreamBootstrapResult<TRow>> | StreamBootstrapResult<TRow>;
    /**
     * Function that wires the low-level stream (SSE/WS/RTSK/etc.)
     * to the library via patches.
     */
    subscribe: StreamSubscribeFn<TRow, TRowId>;
    /**
     * Optional refresh hook (may trigger a new bootstrap or cause the
     * underlying stream to re-emit data).
     */
    refresh?: () => Promise<void> | void;
    /**
     * Optional cleanup hook for shutting down the low-level stream.
     */
    destroy?: () => void;
    /**
     * Optional label for identifying this data source in debugging and logging.
     */
    label?: string;
}
/**
 * Creates a streaming data source for real-time data updates.
 *
 * Supports various streaming protocols including Server-Sent Events (SSE),
 * WebSockets, RTSK, NDJSON, and other push-based data delivery mechanisms.
 * The source can optionally bootstrap with initial data and continuously
 * receive updates via patches.
 *
 * @typeParam TRow - The type of row objects in the data source
 * @typeParam TRowId - The type of row identifiers, defaults to string | number
 *
 * @param options - Configuration options for the streaming data source
 *
 * @returns A DataSource object that manages the streaming connection and data updates
 *
 * @public
 */
declare const createStreamSource: <TRow = any, TRowId extends RowId = RowId>(options: StreamSourceOptions<TRow, TRowId>) => DataSource<TRow, TRowId>;

/**
 * Extracts the id from a row based on the configured idKey.
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param row - The row object from which to extract the id
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns The extracted row identifier of type TRowId
 *
 * @internal
 */
declare const getRowId: <TRow = any, TRowId extends RowId = RowId>(row: TRow, idKey: keyof TRow & string) => TRowId;
/**
 * Applies a single data patch to the current list of rows.
 *
 * @remarks
 * Supports multiple patch types:
 * - `replaceAll`: Replaces the entire rows array with new rows
 * - `append`: Adds a single row to the end of the array
 * - `update`: Updates an existing row by matching its id
 * - `remove`: Removes a row by matching its id
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param rows - The current array of rows to apply the patch to
 * @param patch - The data patch operation to apply
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns A new array of rows with the patch applied
 *
 * @internal
 */
declare const applyPatch: <TRow = any, TRowId extends RowId = RowId>(rows: TRow[], patch: DataPatch<TRow, TRowId>, idKey: keyof TRow & string) => TRow[];
/**
 * Applies a list of patches in order.
 *
 * @remarks
 * Sequentially reduces over the patches array, applying each patch to the result of the previous patch.
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param rows - The initial array of rows to apply the patches to
 * @param patches - An array of data patch operations to apply in order
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns A new array of rows with all patches applied
 *
 * @internal
 */
declare const applyPatches: <TRow = any, TRowId extends RowId = RowId>(rows: TRow[], patches: Array<DataPatch<TRow, TRowId>>, idKey: keyof TRow & string) => TRow[];

export { type ActionContextBase, type ActionKind, type ActiveActionState, type ActiveFilterState, type CellRenderContext, ConfirmModal, type ConfirmModalConfig, type ConfirmModalProps, type CustomModalConfig, type CustomModalRenderContext, type DataPatch, type DataPatchListener, type DataSource, type DataSourceInitResult, type DataSourceKind, type DataSourceMeta, type FieldAlign, type FieldFilterConfig, type FieldSchema, type FilterContext, type FilterOperator, type FilterOption, type FilterType, type FiltersPanelProps, type GeneralAction, type GeneralActionContext, type ListActionBase, ListBody, type ListBodyProps, ListCell, type ListCellProps, type ListComponents, type ListComponentsProps, type ListConfig, ListContainer, type ListContainerProps, ListDisplay, type ListDisplayProps, ListEmptyState, ListErrorState, ListFiltersPanel, ListHeader, type ListHeaderProps, ListLoadingState, ListModalOutlet, ListPagination, ListRow, type ListRowProps, type ListSnapshot, ListSortBar, type ListState, type ListStatus, ListTable, ListToolbar, type ListUiState, type ModalConfig, type ModalOutletProps, type ModalState, type PaginationProps, type PaginationState, type QueryLoadFn, type QueryResult, type QuerySourceOptions, type RowAction, type RowActionContext, type RowId, type SelectionContext, type SelectionMode, type SelectionState, type SortBarProps, type SortDescriptor, type SortDirection, type SortingContext, type StatusStateProps, type StreamBootstrapResult, type StreamSourceOptions, type StreamSubscribeFn, type TableProps, type ToolbarProps, type Unsubscribe, type UseListCoreResult, applyFilters, applyPagination, applyPatch, applyPatches, applySorting, buildFilterPredicate, buildSnapshot, clearActiveAction, clearSelection, closeModal, createInitialUiState, createQuerySource, createSelectionState, createStaticSource, createStreamSource, getRowId, isRowSelected, openModalForAction, selectAllVisible, toggleRowSelection, updatePaginationMeta, useListCore };
