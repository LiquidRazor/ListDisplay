import type {DataSource, DataSourceInitResult, RowId} from "../types";

export interface QueryResult<TRow = any> {
    rows: TRow[];
    totalCount?: number;
}

export type QueryLoadFn<TRow = any> = () =>
    | Promise<QueryResult<TRow>>
    | QueryResult<TRow>;

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
 * Creates a query-based data source (single-shot load + optional refresh).
 */
export const createQuerySource = <
    TRow = any,
    TRowId extends RowId = RowId,
>(
    options: QuerySourceOptions<TRow>
): DataSource<TRow, TRowId> => {
    const {load, label} = options;

    const init = async (): Promise<DataSourceInitResult<TRow>> => {
        const result = await Promise.resolve(load());
        return {
            rows: [...result.rows],
            totalCount: result.totalCount,
        };
    };

    const refresh = async (): Promise<void> => {
        // `useListCore` va decide cum să folosească init() + refresh().
        await Promise.resolve(load());
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
