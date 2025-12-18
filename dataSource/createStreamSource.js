/**
 * Creates a streaming data source (e.g. SSE, WebSocket, RTSK, NDJSON).
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
