import {ListFeatureContext} from "../context/listFeatureContext";

/**
 * Core interface defining the contract for list features in the modular list system.
 *
 * @remarks
 * This interface establishes the structure and lifecycle hooks for features that extend
 * and customize list functionality. Features are composable units that can:
 * - Transform and derive row data
 * - Manage feature-specific state
 * - Respond to lifecycle events (initialization, destruction, refresh)
 * - Contribute UI components and handlers
 * - Expose public APIs to other features
 *
 * Features are compiled together using topological dependency resolution to ensure proper
 * execution order across the feature pipeline stages (derive → handlers → lifecycle → ui).
 * Each feature receives a {@link ListFeatureContext} object that provides access to shared
 * state, other feature APIs, and utility methods.
 *
 * Features support dependency management through both implicit (dependsOn) and explicit
 * (order.before/after) ordering constraints, enabling complex feature compositions while
 * maintaining predictable execution behavior.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the feature's internal state object
 * @typeParam TSnapshot - The type of the feature's serialized state snapshot
 * @typeParam TApi - The type of the public API exposed by this feature to other features
 *
 * @internal
 */
export interface ListFeature<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown,
    TApi = unknown
> {
  /**
   * Unique identifier for this feature within the list system.
   *
   * @remarks
   * This identifier serves multiple purposes:
   * - Uniquely identifies the feature in the compiled feature plan
   * - Used as the key for storing the feature's API in the context.features registry
   * - Referenced by other features in dependency declarations (dependsOn, order)
   * - Used for error reporting and debugging during compilation and execution
   *
   * The identifier must be unique within a single list instance to prevent conflicts
   * during feature registration and API access. Recommended naming convention is to use
   * a namespaced format (e.g., "core:selection", "filters:search") to avoid collisions.
   */
  readonly id: string;

  /**
   * Array of feature IDs that must be compiled and executed before this feature.
   *
   * @remarks
   * This property declares explicit dependencies on other features, ensuring they are
   * available and initialized before this feature's methods are invoked. The dependency
   * resolution system uses these declarations to perform topological sorting and establish
   * a valid execution order across all features.
   *
   * Dependencies are resolved per execution stage (derive, handlers, lifecycle, ui), meaning
   * a feature will execute after its dependencies within each stage where it participates.
   *
   * Common use cases for dependencies:
   * - Accessing another feature's API from context.features
   * - Building on top of data transformations from other features
   * - Ensuring proper initialization order for interdependent features
   *
   * Circular dependencies will cause compilation to fail with a descriptive error.
   * If a declared dependency is not present in the feature list, compilation will also fail.
   */
  readonly dependsOn?: string[];

  /**
   * Explicit ordering constraints for fine-grained control over feature execution sequence.
   *
   * @remarks
   * This property provides additional ordering control beyond the dependency system, allowing
   * features to specify relative positioning without establishing hard dependencies. This is
   * useful when execution order matters but features don't directly depend on each other's APIs.
   *
   * Properties:
   * - `before`: Array of feature IDs that should execute after this feature
   * - `after`: Array of feature IDs that should execute before this feature
   *
   * These constraints are applied during topological sorting and merged with dependsOn
   * declarations to produce the final execution order. Ordering constraints are processed
   * per execution stage, allowing different orderings in different stages if needed.
   *
   * Unlike dependsOn, ordering constraints are optional - if a referenced feature is not
   * present, the constraint is silently ignored rather than causing a compilation error.
   *
   * Example use case: A logging feature might specify `after: ["*"]` to execute last in
   * each stage without establishing dependencies on specific features.
   */
  readonly order?: { before?: string[]; after?: string[] };

  /**
   * Optional validation method invoked during feature compilation to verify configuration.
   *
   * @remarks
   * This method is called early in the compilation process to validate feature configuration
   * and environment requirements before feature creation and execution. It receives a context
   * object containing:
   * - `config`: The feature's configuration object (type is implementation-specific)
   * - `hasUI`: Boolean indicating whether the list has UI rendering capabilities
   *
   * The method should throw an error if validation fails, including a descriptive message
   * explaining the validation failure. Validation errors will halt compilation and be reported
   * to the developer.
   *
   * Common validation scenarios:
   * - Checking required configuration properties are present and valid
   * - Verifying UI-dependent features only run in UI-enabled contexts
   * - Validating configuration value types and ranges
   * - Ensuring incompatible configuration combinations are detected early
   *
   * @param ctx - Validation context containing configuration and environment information
   * @throws Error if validation fails with a descriptive error message
   */
  validate?: (ctx: { config: unknown; hasUI: boolean }) => void;

  /**
   * Optional method that creates and returns the feature's public API.
   *
   * @remarks
   * This method is invoked during feature compilation to create the feature's public API
   * object, which is then registered in the context.features registry under the feature's ID.
   * The returned API becomes accessible to other features and components through the context.
   *
   * The API object can expose:
   * - Methods for interacting with the feature
   * - State accessors and mutators
   * - Configuration and metadata
   * - Event emitters or subscription mechanisms
   *
   * The method receives the full {@link ListFeatureContext}, allowing it to access shared
   * state, other feature APIs, and utility methods when constructing the API object.
   *
   * The created API should be stable by reference across re-renders when possible to
   * optimize React performance and prevent unnecessary effect re-executions.
   *
   * @param ctx - The list feature context providing state, features, and utilities
   * @returns The feature's public API object, or undefined if the feature exposes no API
   */
  create?: (ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>) => TApi;

  /**
   * Optional data transformation method executed during the derive stage of the feature pipeline.
   *
   * @remarks
   * This method processes and transforms row data, executing during the "derive" stage before
   * handlers, lifecycle hooks, and UI rendering. It receives the current rows array (potentially
   * already transformed by previous features) and must return a new rows array with the desired
   * transformations applied.
   *
   * Common use cases:
   * - Adding computed properties to row objects (e.g., fullName from firstName + lastName)
   * - Filtering rows based on feature-specific criteria
   * - Sorting rows according to feature configuration
   * - Enriching rows with data from external sources or other features
   * - Grouping or restructuring row data
   *
   * The method must return a new array and avoid mutating the input rows or row objects
   * directly to maintain immutability and prevent side effects. The returned rows become
   * the input for the next feature's derive method in the pipeline.
   *
   * The derive stage executes synchronously and should complete quickly to avoid blocking
   * rendering. Expensive computations should be memoized or moved to async lifecycle hooks.
   *
   * @param rows - The current rows array, potentially transformed by previous features
   * @param ctx - The list feature context providing state, features, and utilities
   * @returns A new rows array with transformations applied
   */
  derive?: (
      rows: readonly TRow[],
      ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>
  ) => readonly TRow[];

  /**
   * Optional lifecycle hook invoked when the feature is initialized.
   *
   * @remarks
   * This method is called during feature initialization, typically when the list component
   * mounts or when features are first compiled. It executes during the "lifecycle" stage
   * of the feature pipeline, after derive and handlers stages but before UI rendering.
   *
   * The method can perform both synchronous and asynchronous initialization tasks:
   * - Setting up initial feature state
   * - Loading configuration or data from external sources
   * - Registering global event listeners or subscriptions
   * - Initializing connections to external services
   * - Performing validation or setup that requires the full context
   *
   * If the method returns a Promise, the list system will await its completion before
   * proceeding, allowing for async initialization workflows. Multiple features' onInit
   * hooks may execute concurrently unless ordering constraints enforce sequential execution.
   *
   * Errors thrown (or Promise rejections) during initialization will be caught and handled
   * by the list system, typically resulting in an error state or failed initialization.
   *
   * @param ctx - The list feature context providing state, features, and utilities
   * @returns void or a Promise that resolves when initialization is complete
   */
  onInit?: (ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>) => void | Promise<void>;

  /**
   * Optional lifecycle hook invoked when the feature is being destroyed.
   *
   * @remarks
   * This method is called during feature cleanup, typically when the list component unmounts
   * or when features are being torn down. It executes during the "lifecycle" stage and
   * provides an opportunity to perform cleanup operations to prevent memory leaks and
   * release resources.
   *
   * Common cleanup tasks:
   * - Removing global event listeners or subscriptions
   * - Cancelling pending async operations or timers
   * - Closing connections to external services
   * - Clearing caches or temporary data
   * - Disposing of external resources (file handles, database connections, etc.)
   *
   * The method executes synchronously and should complete quickly to avoid delaying the
   * unmount process. Long-running cleanup operations should be designed to complete
   * independently or be cancellable.
   *
   * This hook is guaranteed to be called during normal unmount flows, but may not execute
   * in exceptional circumstances (process termination, browser tab closure, etc.).
   *
   * @param ctx - The list feature context providing state, features, and utilities
   */
  onDestroy?: (ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>) => void;

  /**
   * Optional lifecycle hook invoked when the list data is being refreshed.
   *
   * @remarks
   * This method is called when the context.refresh() method is invoked, typically in response
   * to user actions or external events that require reloading or recalculating list data.
   * It executes during the "lifecycle" stage and can perform both synchronous and asynchronous
   * refresh operations.
   *
   * Common refresh tasks:
   * - Refetching data from external sources
   * - Invalidating and rebuilding caches
   * - Recalculating derived state based on fresh data
   * - Resetting feature state to initial values
   * - Triggering side effects that should occur on data reload
   *
   * If the method returns a Promise, the list system will await its completion before
   * proceeding, allowing for async refresh workflows. The refresh operation may involve
   * multiple features' onRefresh hooks executing concurrently or sequentially based on
   * dependency ordering.
   *
   * Errors thrown (or Promise rejections) during refresh will be caught and handled by
   * the list system, typically resulting in an error state while preserving the previous
   * valid state.
   *
   * @param ctx - The list feature context providing state, features, and utilities
   * @returns void or a Promise that resolves when the refresh operation is complete
   */
  onRefresh?: (ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>) => void | Promise<void>;

  /**
   * Optional UI configuration describing the feature's user interface requirements and contributions.
   *
   * @remarks
   * This property declares UI-related metadata for features that contribute visual components
   * or require UI integration points. It is processed during the "ui" stage of the feature
   * pipeline and validates that required UI infrastructure is present.
   *
   * Properties:
   * - `slots`: Array of slot identifiers where the feature renders UI components
   * - `requiredHandlers`: Array of handler identifiers that must be provided by the UI layer
   *
   * Slots are named rendering locations in the UI where features can inject components
   * (e.g., "headerActions", "rowActions", "footer"). The feature can render into these
   * slots using the provided rendering infrastructure.
   *
   * Required handlers are UI-level callbacks or methods that the feature depends on for
   * functionality (e.g., "onRowClick", "renderCell"). If required handlers are not provided
   * by the UI layer, compilation will fail with a descriptive error.
   *
   * This configuration enables compile-time validation of UI dependencies and ensures
   * features only run in compatible UI environments. Features without UI configurations
   * can run in headless or non-UI contexts.
   */
  ui?: {
    slots?: string[];
    requiredHandlers?: string[];
  };
}
