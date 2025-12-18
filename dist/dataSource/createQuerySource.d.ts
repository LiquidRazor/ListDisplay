import type { DataSource, RowId } from "../types";
export interface QueryResult<TRow = any> {
    rows: TRow[];
    totalCount?: number;
}
export type QueryLoadFn<TRow = any> = () => Promise<QueryResult<TRow>> | QueryResult<TRow>;
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
export declare const createQuerySource: <TRow = any, TRowId extends RowId = RowId>(options: QuerySourceOptions<TRow>) => DataSource<TRow, TRowId>;
//# sourceMappingURL=createQuerySource.d.ts.map