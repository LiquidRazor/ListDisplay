import type { ListStatus } from "./uiState";
import type { RowId } from "./selection";

/**
 * Defines the kind of data source being used.
 * - `static`: Fixed data provided once at initialization
 * - `stream`: Real-time data that can push updates incrementally
 * - `query`: Data fetched from a query-based source (e.g., REST API, GraphQL)
 *
 * @public
 */
export type DataSourceKind = "static" | "stream" | "query";

/**
 * Result object returned by the data source's initial load operation.
 *
 * @public
 */
export interface DataSourceInitResult<TRow = any> {
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
   * {@link ListStatus}
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
export type DataPatch<TRow = any, TRowId = RowId> =
  | { type: "replaceAll"; rows: TRow[] }
  | { type: "append"; row: TRow }
  | { type: "update"; row: TRow }
  | { type: "remove"; id: TRowId };

/**
 * Callback function invoked when a data patch is received from the data source.
 * {@link DataPatch}
 *
 * @public
 */
export type DataPatchListener<TRow = any, TRowId = RowId> = (
  patch: DataPatch<TRow, TRowId>
) => void;

/**
 * Function returned by subscribe() that can be called to unsubscribe from data updates.
 *
 * @public
 */
export type Unsubscribe = () => void;

/**
 * Metadata describing a data source's characteristics.
 *
 * @public
 */
export interface DataSourceMeta {
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
export interface DataSource<TRow = any, TRowId = RowId> {
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
