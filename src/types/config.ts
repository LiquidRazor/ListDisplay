import type { GeneralAction, RowAction } from "./actions";
import type { ListComponents, ListComponentsProps } from "./components";
import type { DataSource } from "./dataSource";
import type { FieldSchema } from "./fieldSchema";
import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { RowId, SelectionMode } from "./selection";

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
export interface ListConfig<TRow = any, TRowId = RowId> {
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
