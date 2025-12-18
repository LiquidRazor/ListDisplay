// src/dataSource/createStaticSource.ts
import type {
  DataSource,
  DataSourceInitResult,
    RowId
} from "../types";

interface StaticSourceOptions<TRow = any> {
  /**
   * Initial set of rows.
   */
  initialRows?: TRow[];

  /**
   * Optional function to lazily provide rows (e.g. computed).
   */
  getRows?: () => TRow[];
}

/**
 * Creates a simple, static data source that just returns an initial
 * snapshot of rows and does not stream patches.
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
