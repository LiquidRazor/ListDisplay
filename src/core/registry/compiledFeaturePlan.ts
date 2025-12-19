import {ListFeatureContext} from "../context/listFeatureContext";
import {FeatureUIContract} from "../contracts/featureUIContract";

/**
 * Compiled execution plan containing ordered collections of feature functions and APIs.
 *
 * @remarks
 * This interface represents the result of the feature compilation process, where all registered
 * features have been resolved, ordered according to their dependencies, and organized into
 * separate execution pipelines for each processing stage. The compiled plan serves as an
 * optimized blueprint for creating runtime instances that execute features in the correct order.
 *
 * The compilation process performs the following operations:
 * - Topologically sorts features based on their declared dependencies
 * - Collects and orders functions for each lifecycle hook (init, destroy, refresh)
 * - Assembles the data derivation pipeline in dependency order
 * - Aggregates feature-specific APIs into a unified registry
 * - Gathers UI contracts for rendering coordination
 *
 * This compiled plan is immutable and can be reused to create multiple runtime instances,
 * making it suitable for scenarios where the same feature configuration is applied to
 * different data sources or contexts.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 *
 * @see {@link ListRuntimePlan} for the executable runtime instance created from this plan
 * @see {@link createRuntimePlan} for the function that converts a compiled plan into a runtime
 *
 * @public
 */
export interface CompiledFeaturePlan<TRow = any> {
    /**
     * Ordered pipeline of data transformation functions for row derivation.
     *
     * @remarks
     * This array contains functions from the "derive" stage of all compiled features,
     * ordered according to feature dependencies. Each function in the pipeline receives
     * the current row array and the feature context, and returns a transformed row array.
     *
     * The pipeline executes sequentially, with each function's output becoming the input
     * for the next function. This enables features to:
     * - Add computed properties to rows
     * - Filter or reorder rows
     * - Transform existing row data
     * - Enrich rows with additional information
     *
     * The derivation pipeline runs before any lifecycle hooks or UI rendering, ensuring
     * that all derived data is available when needed by other features or components.
     */
    derivePipeline: Array<
        (rows: readonly TRow[], ctx: ListFeatureContext<TRow>) => readonly TRow[]
    >;

    /**
     * Ordered collection of initialization functions to execute during list setup.
     *
     * @remarks
     * This array contains onInit functions from the "lifecycle" stage of all compiled features,
     * ordered according to feature dependencies. Each function receives the feature context
     * and may perform asynchronous initialization operations.
     *
     * Initialization functions typically:
     * - Set up initial feature state
     * - Register event listeners or subscriptions
     * - Perform one-time computations
     * - Load persisted state or configuration
     *
     * All initialization functions are executed sequentially in order, with each function
     * awaited before proceeding to the next. This ensures that features with dependencies
     * are fully initialized before dependent features begin their initialization.
     */
    onInit: Array<(ctx: ListFeatureContext<TRow>) => void | Promise<void>>;

    /**
     * Ordered collection of cleanup functions to execute during list teardown.
     *
     * @remarks
     * This array contains onDestroy functions from the "lifecycle" stage of all compiled features,
     * ordered according to feature dependencies. Each function receives the feature context
     * and performs synchronous cleanup operations.
     *
     * Cleanup functions typically:
     * - Unregister event listeners or subscriptions
     * - Cancel pending operations
     * - Release allocated resources
     * - Clear timers or intervals
     *
     * All cleanup functions are executed sequentially in order, with errors caught and
     * suppressed to ensure that one feature's cleanup failure does not prevent other
     * features from cleaning up properly.
     */
    onDestroy: Array<(ctx: ListFeatureContext<TRow>) => void>;

    /**
     * Ordered collection of refresh functions to execute during data refresh operations.
     *
     * @remarks
     * This array contains onRefresh functions from the "lifecycle" stage of all compiled features,
     * ordered according to feature dependencies. Each function receives the feature context
     * and may perform asynchronous refresh operations.
     *
     * Refresh functions typically:
     * - Update derived state based on new data
     * - Recalculate cached values
     * - Synchronize with external data sources
     * - Reset transient state
     *
     * All refresh functions are executed sequentially in order, with each function awaited
     * before proceeding to the next. This ensures that features can depend on other features
     * having completed their refresh operations.
     */
    onRefresh: Array<(ctx: ListFeatureContext<TRow>) => void | Promise<void>>;

    /**
     * Registry of feature-specific APIs exposed by compiled features.
     *
     * @remarks
     * This object contains the public APIs exported by each compiled feature, indexed by
     * feature name or identifier. Features register their APIs during compilation, making
     * them accessible to other features and external consumers through the context's
     * features property.
     *
     * Feature APIs may include:
     * - Methods for programmatic interaction with the feature
     * - State accessors for reading feature-specific state
     * - Configuration objects
     * - Event emitters or observables
     *
     * The registry is created with a null prototype to prevent prototype chain pollution
     * and ensure predictable property access behavior.
     */
    featureApis: Record<string, unknown>;

    /**
     * Collection of UI contracts defining rendering requirements for each feature.
     *
     * @remarks
     * This object maps feature identifiers to their UI contracts, which describe how
     * the feature should be rendered in the user interface. UI contracts from the "ui"
     * stage define rendering slots, component factories, and other UI-related metadata.
     *
     * UI contracts typically specify:
     * - Component types or factories for rendering
     * - Rendering priorities or ordering
     * - Slot identifiers for component placement
     * - Styling or theming requirements
     *
     * Entries may be undefined if a feature does not provide a UI contract. The contracts
     * are used by rendering layers to coordinate feature visualization and ensure proper
     * component composition.
     */
    uiContracts: Record<string, FeatureUIContract | undefined>;
}

/**
 * Executable runtime instance that orchestrates feature execution and lifecycle management.
 *
 * @remarks
 * This interface represents an executable runtime created from a compiled feature plan.
 * It provides methods for executing the various feature pipelines and managing the feature
 * lifecycle, while maintaining references to the feature context and exposed APIs.
 *
 * The runtime instance is created by {@link createRuntimePlan} and serves as the primary
 * interface for interacting with compiled features during list operation. It encapsulates
 * the execution logic for:
 * - Data derivation through the transformation pipeline
 * - Lifecycle management (initialization, refresh, destruction)
 * - Access to feature APIs and UI contracts
 *
 * Runtime instances are typically created once per list instance and remain active for
 * the lifetime of the list. The runtime maintains stable references to ensure consistent
 * behavior across component renders and state updates.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 *
 * @see {@link CompiledFeaturePlan} for the compiled plan that generates this runtime
 * @see {@link createRuntimePlan} for the factory function that creates runtime instances
 *
 * @public
 */
export interface ListRuntimePlan<TRow = any> {
    /**
     * The feature context object shared across all features.
     *
     * @remarks
     * This property provides direct access to the feature context that was passed to
     * {@link createRuntimePlan} during runtime creation. The context serves as the central
     * coordination point for state management, feature communication, and data operations.
     *
     * The context remains stable by reference throughout the runtime lifetime, though its
     * internal state properties may change. Features and external consumers can use this
     * reference to access state, invoke refresh operations, or interact with registered
     * feature APIs.
     */
    readonly ctx: ListFeatureContext<TRow>;

    /**
     * Registry of feature-specific APIs accessible to consumers.
     *
     * @remarks
     * This property provides direct access to the feature API registry from the context's
     * features property. It contains the public APIs exported by all compiled features,
     * indexed by feature name or identifier.
     *
     * This convenience property eliminates the need to access the registry through
     * `ctx.features`, making feature APIs more easily discoverable and accessible to
     * external consumers.
     */
    readonly features: Record<string, unknown>;

    /**
     * Executes the data derivation pipeline to transform row data.
     *
     * @remarks
     * This method runs all data transformation functions from the compiled derivation
     * pipeline in sequence, passing the output of each function as input to the next.
     * The pipeline processes row data through all registered derive-stage features in
     * dependency order.
     *
     * The derivation process:
     * - Receives an input array of rows
     * - Applies each transformation function sequentially
     * - Returns the final transformed row array
     * - Maintains row immutability (functions return new arrays)
     *
     * This method should be called whenever row data changes or when derived properties
     * need to be recalculated. The derived data is typically used for rendering, filtering,
     * sorting, or other data-dependent operations.
     *
     * @param rows - The input array of row data to transform
     * @returns The transformed array of row data after all derivation functions are applied
     */
    derive: (rows: readonly TRow[]) => readonly TRow[];

    /**
     * Initializes all features by executing their onInit lifecycle hooks.
     *
     * @remarks
     * This method runs all initialization functions from the compiled onInit collection
     * in sequence, awaiting each function before proceeding to the next. Initialization
     * establishes the initial state and configuration for all features.
     *
     * The initialization process:
     * - Executes onInit functions in dependency order
     * - Awaits asynchronous initialization operations
     * - Ensures dependent features initialize after their dependencies
     * - Completes before the list becomes interactive
     *
     * This method should be called once during list setup, typically after the context
     * is created but before any data operations or rendering occurs. Initialization
     * failures may prevent the list from functioning correctly.
     *
     * @returns A promise that resolves when all initialization functions have completed
     */
    init: () => Promise<void>;

    /**
     * Refreshes all features by executing their onRefresh lifecycle hooks.
     *
     * @remarks
     * This method runs all refresh functions from the compiled onRefresh collection in
     * sequence, awaiting each function before proceeding to the next. Refresh operations
     * update feature state and derived data in response to data source changes.
     *
     * The refresh process:
     * - Executes onRefresh functions in dependency order
     * - Awaits asynchronous refresh operations
     * - Ensures dependent features refresh after their dependencies
     * - Typically triggered by data source changes or manual refresh requests
     *
     * This method is called through the context's refresh function and may be invoked
     * multiple times throughout the list lifetime. Features should implement idempotent
     * refresh logic that safely handles repeated invocations.
     *
     * @returns A promise that resolves when all refresh functions have completed
     */
    refresh: () => Promise<void>;

    /**
     * Destroys all features by executing their onDestroy lifecycle hooks.
     *
     * @remarks
     * This method runs all cleanup functions from the compiled onDestroy collection in
     * sequence, catching and suppressing any errors to ensure all features have an
     * opportunity to clean up. Destruction releases resources and removes event listeners.
     *
     * The destruction process:
     * - Executes onDestroy functions in dependency order
     * - Catches and suppresses errors from individual functions
     * - Ensures all cleanup attempts complete regardless of failures
     * - Typically called once during list unmounting or disposal
     *
     * This method should be called when the list is being torn down or removed from the
     * DOM. After destruction, the runtime instance should not be used for further operations.
     * Features should implement cleanup logic that safely handles being called multiple times.
     */
    destroy: () => void;

    /**
     * Collection of UI contracts defining rendering requirements for each feature.
     *
     * @remarks
     * This property provides access to the UI contracts from the compiled feature plan,
     * which describe how features should be rendered in the user interface. The contracts
     * are passed directly from the compiled plan without modification.
     *
     * UI contracts are used by rendering layers to:
     * - Determine which components to render for each feature
     * - Coordinate component placement and ordering
     * - Apply feature-specific styling or theming
     * - Manage rendering slots and composition
     *
     * Entries may be undefined if a feature does not provide a UI contract.
     */
    uiContracts: Record<string, FeatureUIContract | undefined>;
}


/**
 * Creates an executable runtime instance from a compiled feature plan and context.
 *
 * @remarks
 * This factory function transforms a compiled feature plan into an executable runtime
 * by binding the plan's function collections to a specific feature context. The resulting
 * runtime instance provides methods for executing feature pipelines and managing the
 * feature lifecycle.
 *
 * The creation process performs the following operations:
 * 1. Creates immutable frozen copies of all function arrays to prevent runtime modification
 * 2. Registers all feature APIs into the context's features registry
 * 3. Defines execution methods that iterate through function collections
 * 4. Returns a runtime object with stable references for lifecycle management
 *
 * The created runtime encapsulates the execution logic for:
 * - **derive**: Sequentially applies all derivation functions to transform row data
 * - **init**: Sequentially executes and awaits all initialization functions
 * - **refresh**: Sequentially executes and awaits all refresh functions
 * - **destroy**: Sequentially executes all cleanup functions with error suppression
 *
 * Function arrays are frozen to ensure the execution order cannot be modified after
 * runtime creation, maintaining the dependency-based ordering established during
 * compilation. This immutability prevents runtime bugs caused by unexpected function
 * collection mutations.
 *
 * Feature APIs are merged into the context's features registry using Object.assign,
 * making them accessible to all features and external consumers through a shared
 * reference. This enables cross-feature communication and programmatic feature control.
 *
 * Error handling strategy:
 * - Initialization and refresh functions propagate errors to callers
 * - Destruction functions suppress all errors to ensure complete cleanup
 * - Derivation functions should handle errors internally or propagate them
 *
 * @typeParam TRow - The type of individual row data objects in the list
 *
 * @param ctx - The feature context providing state management and coordination
 * @param compiled - The compiled feature plan containing ordered function collections
 *
 * @returns An executable runtime instance bound to the provided context
 *
 * @see {@link CompiledFeaturePlan} for the structure of compiled feature plans
 * @see {@link ListRuntimePlan} for the structure of the returned runtime instance
 * @see {@link ListFeatureContext} for the context object interface
 *
 * @public
 */
export function createRuntimePlan<TRow = any>(
    ctx: ListFeatureContext<TRow>,
    compiled: CompiledFeaturePlan<TRow>
): ListRuntimePlan<TRow> {
    const derivePipeline = Object.freeze([...compiled.derivePipeline]);
    const onInit = Object.freeze([...compiled.onInit]);
    const onDestroy = Object.freeze([...compiled.onDestroy]);
    const onRefresh = Object.freeze([...compiled.onRefresh]);

    Object.assign(ctx.features, compiled.featureApis);

    const derive = (rows: readonly TRow[]): readonly TRow[] => {
        let out = rows;
        for (const step of derivePipeline) {
            out = step(out, ctx);
        }
        return out;
    };

    const init = async (): Promise<void> => {
        for (const fn of onInit) {
            await fn(ctx);
        }
    };

    const refresh = async (): Promise<void> => {
        for (const fn of onRefresh) {
            await fn(ctx);
        }
    };

    const destroy = (): void => {
        for (const fn of onDestroy) {
            try {
                fn(ctx);
            } catch {
            }
        }
    };

    return {
        ctx,
        features: ctx.features,
        derive,
        init,
        refresh,
        destroy,
        uiContracts: compiled.uiContracts
    };
}
