import type { DataPatchListener, DataSource, Unsubscribe, RowId } from "../types";
/**
 * Result object returned by the bootstrap function of a streaming data source.
 * Contains optional initial data and metadata for the stream.
 *
 * @public
 */
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
/**
 * Function type for subscribing to streaming data updates.
 * Receives a patch listener and returns an optional unsubscribe function.
 *
 * @public
 */
export type StreamSubscribeFn<TRow = any, TRowId extends RowId = RowId> = (listener: DataPatchListener<TRow, TRowId>) => Unsubscribe | void;
/**
 * Configuration options for creating a streaming data source.
 * Defines how to bootstrap, subscribe to, refresh, and destroy a streaming connection.
 *
 * @public
 */
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
    /**
     * Optional label for identifying this data source in debugging and logging.
     */
    label?: string;
}
/**
 * Creates a streaming data source for real-time data updates.
 *
 * Supports various streaming protocols including Server-Sent Events (SSE),
 * WebSockets, RTSK, NDJSON, and other push-based data delivery mechanisms.
 * The source can optionally bootstrap with initial data and continuously
 * receive updates via patches.
 *
 * @typeParam TRow - The type of row objects in the data source
 * @typeParam TRowId - The type of row identifiers, defaults to string | number
 *
 * @param options - Configuration options for the streaming data source
 *
 * @returns A DataSource object that manages the streaming connection and data updates
 *
 * @public
 */
export declare const createStreamSource: <TRow = any, TRowId extends RowId = RowId>(options: StreamSourceOptions<TRow, TRowId>) => DataSource<TRow, TRowId>;
//# sourceMappingURL=createStreamSource.d.ts.map