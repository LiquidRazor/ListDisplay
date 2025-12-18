/**
 * Creates a query-based data source (single-shot load + optional refresh).
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
