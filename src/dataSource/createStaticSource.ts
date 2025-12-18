import type {
  DataSource,
  DataSourceInitResult,
    RowId
} from "../types";

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
export const createStaticSource = <
  TRow = any,
  TRowId extends RowId = RowId,
>(
  options: StaticSourceOptions<TRow> = {}
): DataSource<TRow, TRowId> => {
  const { initialRows = [], getRows } = options;

  const init = async (): Promise<DataSourceInitResult<TRow>> => {
    const rows = getRows ? getRows() : initialRows;
    return {
      rows: [...rows],
    };
  };

  return {
    meta: {
      kind: "static",
      label: "static",
    },
    init,
  };
};
