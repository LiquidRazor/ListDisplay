/**
 * Creates a simple, static data source that returns an initial snapshot of rows without streaming updates or patches.
 *
 * @remarks
 * This data source is ideal for static lists where data does not change after initialization.
 * It provides all rows upfront during the `init` call and does not support real-time updates.
 *
 * @typeParam TRow - The type of row objects in the data source
 * @typeParam TRowId - The type of row identifiers (defaults to RowId)
 *
 * @param options - Configuration options for the static data source
 *
 * @returns A DataSource instance configured with the provided static data
 *
 * @public
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
//# sourceMappingURL=createStaticSource.js.map