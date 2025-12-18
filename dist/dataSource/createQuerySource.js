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
export const createQuerySource = (options) => {
    const { load, label } = options;
    const init = async () => {
        const result = await Promise.resolve(load());
        return {
            rows: [...result.rows],
            totalCount: result.totalCount,
        };
    };
    const refresh = async () => {
        // `useListCore` will decide how to use init() + refresh().
        await load();
    };
    return {
        meta: {
            kind: "query",
            label: label ?? "query",
        },
        init,
        refresh,
    };
};
//# sourceMappingURL=createQuerySource.js.map