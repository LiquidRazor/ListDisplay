/**
 * Union type representing the possible loading states of list data.
 *
 * @remarks
 * This type defines the four distinct states that a list can be in during its data lifecycle:
 *
 * - **idle** - Initial state before any data loading has been attempted
 * - **loading** - Data is currently being fetched or processed
 * - **ready** - Data has been successfully loaded and is available for use
 * - **error** - An error occurred during data loading or processing
 *
 * The status progression typically follows: idle → loading → (ready | error)
 * The refresh operation can transition from ready → loading → (ready | error)
 *
 * @see {@link CoreListState.status} for usage within the core state structure
 *
 * @internal
 */
export type ListStatus = "idle" | "loading" | "ready" | "error";

/**
 * Type representing a bag of feature-specific state data.
 *
 * @remarks
 * This type defines a generic storage mechanism for features to persist their own state
 * within the core list state. Each feature can store arbitrary data indexed by a string key,
 * allowing features to maintain isolated state without knowledge of other features' state structures.
 *
 * Features typically use their feature name or a unique identifier as the key to store and
 * retrieve their state from the bag. The value type is intentionally flexible (unknown) to
 * accommodate diverse feature requirements.
 *
 * @example
 * ```typescript
 * const featureState: FeatureStateBag = {
 *   sorting: { column: 'name', direction: 'asc' },
 *   filtering: { searchTerm: 'test', activeFilters: [] },
 *   pagination: { page: 1, pageSize: 20 }
 * };
 * ```
 *
 * @see {@link CoreListState.featureState} for usage within the core state structure
 *
 * @internal
 */
export type FeatureStateBag = Record<string, unknown>;

/**
 * Interface representing the core state structure for list data management.
 *
 * @remarks
 * This interface defines the fundamental state shape used by the list system to manage
 * row data, feature state, and loading status. It serves as the foundation for all list
 * operations and is extended by specific list implementations to add additional state properties.
 *
 * The state maintains two separate row collections:
 * - `rawRows`: The original unprocessed data as received from the data source
 * - `rows`: The processed data after applying features like filtering, sorting, or transformation
 *
 * This separation enables features to operate on data in stages while preserving the original
 * data for reference or reprocessing. Features execute in a defined pipeline (derive → handlers →
 * lifecycle → ui) and can store their own state in the `featureState` bag.
 *
 * @typeParam TRow - The type of individual row data objects in the list (defaults to any for flexibility)
 *
 * @example
 * ```typescript
 * const listState: CoreListState<User> = {
 *   rawRows: [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
 *   rows: [{ id: 1, name: 'Alice' }], // After filtering
 *   featureState: {
 *     filtering: { searchTerm: 'Alice' }
 *   },
 *   status: 'ready'
 * };
 * ```
 *
 * @see {@link ListFeatureContext} for the context object that provides access to this state
 * @see {@link FeatureStage} for information about the feature execution pipeline
 *
 * @internal
 */
export interface CoreListState<TRow = any> {
    /**
     * Array containing the original unprocessed row data from the data source.
     *
     * @remarks
     * This property holds the raw data as received from the data source before any feature
     * processing or transformations are applied. It serves as the immutable source of truth
     * for the original data and enables features to access unmodified data when needed.
     *
     * The `rawRows` array should not be modified directly by features. Instead, features should
     * read from `rawRows` and write their processed results to the `rows` property. This pattern
     * ensures data integrity and allows for proper feature pipeline execution.
     */
    rawRows: TRow[];
    /**
     * Array containing the processed and transformed row data ready for consumption.
     *
     * @remarks
     * This property holds the row data after all feature processing, filtering, sorting, and
     * transformations have been applied. It represents the final data that should be rendered
     * in the UI or consumed by components.
     *
     * Features in the "derive" stage typically read from `rawRows` and write to this property.
     * Features in later stages (handlers, lifecycle, ui) should read from this property to access
     * the fully processed data. The array may contain fewer items than `rawRows` due to filtering,
     * or may contain enriched items with additional computed properties.
     */
    rows: TRow[];
    /**
     * Storage bag for feature-specific state data indexed by feature identifier.
     *
     * @remarks
     * This property provides isolated state storage for each feature participating in the list
     * management system. Features use unique string keys (typically their feature name) to store
     * and retrieve their own state without interfering with other features' state.
     *
     * Features are responsible for managing their own state structure and should initialize their
     * state entry during the compile phase or first execution. The state values are intentionally
     * untyped (unknown) to allow maximum flexibility for diverse feature requirements.
     *
     * @see {@link FeatureStateBag} for the type definition and usage examples
     */
    featureState: FeatureStateBag
    /**
     * Current loading status of the list data.
     *
     * @remarks
     * This property tracks the current state of data loading and processing operations. It enables
     * features and UI components to respond appropriately to different data lifecycle phases, such
     * as showing loading indicators, handling errors, or enabling interactions when data is ready.
     *
     * The status typically progresses through: idle → loading → (ready | error)
     * Status transitions are managed by the list runtime during data refresh operations.
     *
     * @see {@link ListStatus} for detailed information about each possible status value
     */
    status: ListStatus;
    /**
     * Optional error information captured when the status is "error".
     *
     * @remarks
     * This property holds error details when a data loading or processing operation fails and the
     * status transitions to "error". The error value is intentionally untyped (unknown) to accommodate
     * various error formats from different data sources (Error objects, error messages, HTTP responses, etc.).
     *
     * Features and components should check the `status` property first before accessing this property.
     * This property may be undefined when status is not "error" or when no error information is available.
     *
     * @example
     * ```typescript
     * if (state.status === 'error' && state.error) {
     *   console.error('List loading failed:', state.error);
     * }
     * ```
     */
    error?: unknown;
}
