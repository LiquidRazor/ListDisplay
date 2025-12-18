import type { ListStatus } from "./uiState";
import type { RowId } from "./selection";
export type DataSourceKind = "static" | "stream" | "query";
export interface DataSourceInitResult<TRow = any> {
    rows: TRow[];
    totalCount?: number;
    status?: ListStatus;
}
export type DataPatch<TRow = any, TRowId = RowId> = {
    type: "replaceAll";
    rows: TRow[];
} | {
    type: "append";
    row: TRow;
} | {
    type: "update";
    row: TRow;
} | {
    type: "remove";
    id: TRowId;
};
export type DataPatchListener<TRow = any, TRowId = RowId> = (patch: DataPatch<TRow, TRowId>) => void;
export type Unsubscribe = () => void;
export interface DataSourceMeta {
    kind: DataSourceKind;
    label?: string;
}
/**
 * Generic, technology-agnostic data source contract.
 * Wraps parent-provided data, streams, queries etc.
 */
export interface DataSource<TRow = any, TRowId = RowId> {
    meta: DataSourceMeta;
    /**
     * Initial load. Must resolve with at least the initial rows.
     */
    init: () => Promise<DataSourceInitResult<TRow>>;
    /**
     * Optional stream of patches for incremental updates.
     */
    subscribe?: (listener: DataPatchListener<TRow, TRowId>) => Unsubscribe;
    /**
     * Optional refresh hook (refetch / reload).
     */
    refresh?: () => Promise<void> | void;
    /**
     * Optional cleanup hook (unsubscribe, close sockets, etc.).
     */
    destroy?: () => void;
}
//# sourceMappingURL=dataSource.d.ts.map