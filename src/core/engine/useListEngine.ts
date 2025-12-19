import { useCallback, useEffect } from "react";
import {CoreListState} from "../store/coreState";
import {ListStore} from "../store/listStore";


/**
 * Result object returned from data source initialization.
 *
 * @remarks
 * This type defines the structure of the result returned by the `init` method of a data source.
 * It provides the initial rows and optional status information about the initialization operation.
 * If rows are not provided, an empty array will be used. If status is not provided, "ready" will
 * be assumed as the default status.
 *
 * @typeParam TRow - The type of individual row data objects
 *
 * @public
 */
export type DataSourceInitResult<TRow> = {
    rows?: TRow[];
    status?: "ready" | "loading" | "error";
};

/**
 * Interface defining the contract for data sources that provide rows to the list engine.
 *
 * @remarks
 * This type describes the required and optional methods that a data source must implement
 * to work with the list engine. Data sources are responsible for:
 * - Initial data loading via the `init` method
 * - Optional real-time updates via the `subscribe` method
 * - Optional cleanup operations via the `destroy` method
 *
 * The data source abstraction allows the list engine to work with various data providers
 * including static data, REST APIs, WebSocket connections, or any other data source that
 * implements this interface.
 *
 * @typeParam TRow - The type of individual row data objects provided by the data source
 * @typeParam TPatch - The type of patch objects used for incremental updates (defaults to unknown)
 *
 * @public
 */
export type DataSource<TRow, TPatch = unknown> = {
    /**
     * Initializes the data source and retrieves the initial set of rows.
     *
     * @remarks
     * This method is called once during the initial setup of the list engine. It should
     * perform any necessary initialization operations and return the initial data set.
     * The method is asynchronous to support data sources that require network requests
     * or other async operations.
     *
     * @returns A promise that resolves to a DataSourceInitResult containing the initial rows and status
     */
    init: () => Promise<DataSourceInitResult<TRow>>;

    /**
     * Optional method to subscribe to incremental data updates.
     *
     * @remarks
     * If provided, this method allows the data source to push incremental updates (patches)
     * to the list engine after the initial load. The subscription mechanism enables real-time
     * data synchronization without requiring full data reloads.
     *
     * @param onPatch - Callback function that receives patch objects when updates occur
     * @returns Optional cleanup function to unsubscribe from updates
     */
    subscribe?: (onPatch: (patch: TPatch) => void) => void | (() => void);

    /**
     * Optional cleanup method called when the data source is no longer needed.
     *
     * @remarks
     * This method should release any resources held by the data source, such as network
     * connections, timers, or event listeners. It is called during component unmounting
     * or when the data source is replaced.
     */
    destroy?: () => void;
};

/**
 * Function type for applying incremental patches to the current row data.
 *
 * @remarks
 * This function type defines the signature for patch application logic that transforms
 * the current rows based on a patch object. The patch application function is responsible
 * for interpreting the patch format and producing an updated rows array.
 *
 * Common patch operations include:
 * - Adding new rows to the array
 * - Updating existing rows based on identifiers
 * - Removing rows from the array
 * - Reordering rows
 *
 * The function must return a new array and should not mutate the input rows array to
 * maintain immutability and ensure proper change detection.
 *
 * @typeParam TRow - The type of individual row data objects
 * @typeParam TPatch - The type of patch objects that describe incremental changes
 *
 * @param rows - The current array of rows before the patch is applied
 * @param patch - The patch object describing the changes to apply
 * @returns A new array of rows with the patch applied
 *
 * @public
 */
export type ApplyPatchFn<TRow, TPatch> = (rows: TRow[], patch: TPatch) => TRow[];

/**
 * React hook that manages the list engine lifecycle, data loading, and real-time updates.
 *
 * @remarks
 * This hook coordinates the core list engine operations including:
 * - Initial data loading from the data source
 * - State management through the provided store
 * - Real-time data synchronization via subscription patches
 * - Manual refresh capabilities
 * - Cleanup on component unmount
 *
 * The hook integrates the data source with the list store, handling loading states,
 * error states, and data updates automatically. It sets up the subscription to patches
 * if the data source supports it and applies patches using the provided applyPatch function.
 *
 * Lifecycle behavior:
 * - On mount: Calls refresh() to perform initial data load
 * - On mount: Subscribes to data source patches if subscribe method is available
 * - On unmount: Unsubscribes from patches and calls destroy() on the data source
 * - On dependency change: Re-initializes the entire lifecycle
 *
 * @typeParam TRow - The type of individual row data objects
 * @typeParam TPatch - The type of patch objects used for incremental updates
 *
 * @param args - Configuration object for the list engine
 * @param args.store - The list store instance that manages the list state
 * @param args.dataSource - The data source that provides rows and optional real-time updates
 * @param args.applyPatch - Optional function to apply patches to the current rows array
 *
 * @returns Object containing the refresh function for manual data reloading
 *
 * @public
 */
export function useListEngine<TRow, TPatch>(args: {
    store: ListStore<CoreListState<TRow>>;
    dataSource: DataSource<TRow, TPatch>;
    applyPatch?: ApplyPatchFn<TRow, TPatch>;
}) {
    const { store, dataSource, applyPatch } = args;

    const refresh = useCallback(async () => {
        store.setState((prev) => ({ ...prev, status: "loading", error: undefined }));

        try {
            const result = await dataSource.init();
            store.setState((prev) => ({
                ...prev,
                rawRows: result.rows ?? [],
                status: (result.status as any) ?? "ready",
                error: undefined,
            }));
        } catch (err) {
            store.setState((prev) => ({ ...prev, status: "error", error: err }));
        }
    }, [dataSource, store]);

    useEffect(() => {
        refresh();

        if (!dataSource.subscribe) return;

        const unsub = dataSource.subscribe((patch) => {
            if (!applyPatch) return;

            store.setState((prev) => ({
                ...prev,
                rawRows: applyPatch(prev.rawRows, patch),
            }));
        });

        return () => {
            if (typeof unsub === "function") unsub();
            dataSource.destroy?.();
        };
    }, [dataSource, applyPatch, refresh, store]);

    return { refresh };
}
