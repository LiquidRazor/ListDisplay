import type { DataSource, RowId } from "../types";
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
export declare const createStaticSource: <TRow = any, TRowId extends RowId = RowId>(options?: StaticSourceOptions<TRow>) => DataSource<TRow, TRowId>;
export {};
//# sourceMappingURL=createStaticSource.d.ts.map