/**
 * Creates a simple, static data source that just returns an initial
 * snapshot of rows and does not stream patches.
 */
export const createStaticSource = (options = {}) => {
    const { initialRows = [], getRows } = options;
    const init = async () => {
        const rows = getRows ? getRows() : initialRows;
        return {
            rows: [...rows],
        };
    };
    return {
        meta: {
            kind: "static",
            label: "static",
        },
        init,
    };
};
