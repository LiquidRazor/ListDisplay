import type { GeneralAction, RowAction } from "./actions";
import type { ListComponents, ListComponentsProps } from "./components";
import type { DataSource } from "./dataSource";
import type { FieldSchema } from "./fieldSchema";
import type { ActiveFilterState } from "./filters";
import type { PaginationState } from "./pagination";
import type { SortDescriptor } from "./sorting";
import type { RowId, SelectionMode } from "./selection";

/**
 * Public configuration accepted by ListDisplay.
 */
export interface ListConfig<TRow = any, TRowId = RowId> {
  /**
   * Data source adapter.
   */
  dataSource: DataSource<TRow, TRowId>;

  /**
   * Column definitions.
   */
  fields: Array<FieldSchema<TRow>>;

  /**
   * Property name on TRow used as identifier.
   */
  idKey: keyof TRow & string;

  /**
   * General (toolbar-level) actions.
   */
  generalActions?: Array<GeneralAction<TRow, TRowId>>;

  /**
   * Row-level actions.
   */
  rowActions?: Array<RowAction<TRow, TRowId>>;

  /**
   * Initial filters map.
   */
  initialFilters?: ActiveFilterState;

  /**
   * Initial sort descriptor.
   */
  initialSort?: SortDescriptor<TRow>;

  /**
   * Initial pagination state.
   */
  initialPagination?: PaginationState;

  /**
   * Selection mode for the list.
   */
  selectionMode?: SelectionMode;

  /**
   * Overridable UI components (slots).
   */
  components?: ListComponents;

  /**
   * Optional props passed to slot components.
   */
  componentsProps?: ListComponentsProps;
}
