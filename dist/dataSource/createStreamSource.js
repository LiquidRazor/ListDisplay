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
export const createStreamSource = (options) => {
    const { bootstrap, subscribe, refresh, destroy, label } = options;
    const init = async () => {
        if (!bootstrap) {
            return { rows: [] };
        }
        const result = await Promise.resolve(bootstrap());
        return {
            rows: result.initialRows ? [...result.initialRows] : [],
            totalCount: result.totalCount,
        };
    };
    let unsubscribe;
    return {
        meta: {
            kind: "stream",
            label: label ?? "stream",
        },
        init,
        subscribe: (listener) => {
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
//# sourceMappingURL=createStreamSource.js.map