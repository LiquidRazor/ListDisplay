import type {DataPatchListener, DataSource, DataSourceInitResult, Unsubscribe,RowId} from "../types";

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

export type StreamSubscribeFn<TRow = any, TRowId extends RowId = RowId> = (
    listener: DataPatchListener<TRow, TRowId>
) => Unsubscribe | void;

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
export const createStreamSource = <
    TRow = any,
    TRowId extends RowId = RowId,
>(
    options: StreamSourceOptions<TRow, TRowId>
): DataSource<TRow, TRowId> => {
    const {bootstrap, subscribe, refresh, destroy, label} = options;

    const init = async (): Promise<DataSourceInitResult<TRow>> => {
        if (!bootstrap) {
            return {rows: []};
        }

        const result = await Promise.resolve(bootstrap());
        return {
            rows: result.initialRows ? [...result.initialRows] : [],
            totalCount: result.totalCount,
        };
    };

    let unsubscribe: Unsubscribe | undefined;

    return {
        meta: {
            kind: "stream",
            label: label ?? "stream",
        },

        init,

        subscribe: (listener: DataPatchListener<TRow, TRowId>): Unsubscribe => {
            const maybeUnsub = subscribe(listener);
            if (typeof maybeUnsub === "function") {
                unsubscribe = maybeUnsub;
            }

            return () => {
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = undefined;
                }
            };
        },

        refresh: refresh,

        destroy: () => {
            if (unsubscribe) {
                unsubscribe();
                unsubscribe = undefined;
            }
            destroy?.();
        },
    };
};
