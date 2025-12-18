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
import type { DataSource, RowId } from "../types";
/**
 * Result object returned by a query load function.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 *
 * @public
 */
export interface QueryResult<TRow = any> {
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
export type QueryLoadFn<TRow = any> = () => Promise<QueryResult<TRow>> | QueryResult<TRow>;
/**
 * Configuration options for creating a query-based data source.
 *
 * @typeParam TRow - The type of individual row objects in the result set
 *
 * @public
 */
export interface QuerySourceOptions<TRow = any> {
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
export declare const createQuerySource: <TRow = any, TRowId extends RowId = RowId>(options: QuerySourceOptions<TRow>) => DataSource<TRow, TRowId>;
//# sourceMappingURL=createQuerySource.d.ts.map