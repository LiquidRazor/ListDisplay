import type { DataPatchListener, DataSource, Unsubscribe, RowId } from "../types";
export interface StreamBootstrapResult<TRow = any> {
    /**
     * Optional initial snapshot loaded when the list mounts.
     */
    initialRows?: TRow[];
    /**
     * Optional total count if known.
     */
    totalCount?: number;
}
export type StreamSubscribeFn<TRow = any, TRowId extends RowId = RowId> = (listener: DataPatchListener<TRow, TRowId>) => Unsubscribe | void;
export interface StreamSourceOptions<TRow = any, TRowId extends RowId = RowId> {
    /**
     * Optional bootstrap function to get an initial snapshot.
     */
    bootstrap?: () => Promise<StreamBootstrapResult<TRow>> | StreamBootstrapResult<TRow>;
    /**
     * Function that wires the low-level stream (SSE/WS/RTSK/etc.)
     * to the library via patches.
     */
    subscribe: StreamSubscribeFn<TRow, TRowId>;
    /**
     * Optional refresh hook (may trigger a new bootstrap or cause the
     * underlying stream to re-emit data).
     */
    refresh?: () => Promise<void> | void;
    /**
     * Optional cleanup hook for shutting down the low-level stream.
     */
    destroy?: () => void;
    label?: string;
}
/**
 * Creates a streaming data source (e.g. SSE, WebSocket, RTSK, NDJSON).
 */
export declare const createStreamSource: <TRow = any, TRowId extends RowId = RowId>(options: StreamSourceOptions<TRow, TRowId>) => DataSource<TRow, TRowId>;
//# sourceMappingURL=createStreamSource.d.ts.map