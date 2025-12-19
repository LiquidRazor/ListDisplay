import * as react_jsx_runtime from 'react/jsx-runtime';
import { ComponentType } from 'react';

/**
 * Function type for updating state immutably using an updater function pattern.
 *
 * @remarks
 * This function type accepts an updater function that receives the previous state
 * and returns the next state. This pattern ensures immutable state updates and is
 * commonly used in React-style state management to prevent direct state mutations.
 *
 * @typeParam TState - The type of the state object being updated
 *
 * @param updater - Function that receives the previous state and returns the new state
 *
 * @public
 */
type SetStateFn<TState> = (updater: (prev: TState) => TState) => void;
/**
 * Core context interface that provides shared state, features, and utility methods for list management.
 *
 * @remarks
 * This interface defines the contract for the list feature context object that is passed to all
 * features during compilation and execution. It serves as the central coordination point for:
 * - State management (reactive and non-reactive access)
 * - Feature registration and API access
 * - Data refresh operations
 * - State serialization/export
 * - Metadata configuration
 *
 * The context object remains stable by reference across renders, with state mutations tracked
 * through the `stateRef.current` property to optimize rendering performance.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the internal list state object
 * @typeParam TSnapshot - The type of the exported/serialized state snapshot
 *
 * @public
 */
interface ListFeatureContext<TRow = any, TRowId = any, TState = unknown, TSnapshot = unknown> {
    /**
     * The current state object for reactive access.
     *
     * @remarks
     * This property provides direct access to the current state and is intended for use
     * in reactive contexts where changes should trigger re-renders. When accessed from
     * React components, updates to this property will cause the component to re-render.
     */
    readonly state: TState;
    /**
     * Mutable reference object containing the current state for non-reactive access.
     *
     * @remarks
     * This reference provides access to the current state without triggering re-renders.
     * It is useful for scenarios where the latest state is needed but updates should not
     * cause component re-renders, such as in event handlers or effect cleanup functions.
     * The `.current` property is updated synchronously with state changes.
     */
    readonly stateRef: {
        current: TState;
    };
    /**
     * Function to update the state immutably using an updater pattern.
     *
     * @remarks
     * This function accepts an updater function that receives the previous state and returns
     * the next state. It ensures immutable state updates and triggers re-renders in reactive
     * contexts. The updater function should not mutate the previous state directly but instead
     * return a new state object with the desired changes.
     */
    readonly setState: SetStateFn<TState>;
    /**
     * Asynchronous function that refreshes or refetches the list data.
     *
     * @remarks
     * This method triggers a complete data refresh operation, typically by refetching data
     * from a data source or recalculating derived state. The implementation is provided by
     * the list runtime creator and may involve network requests, cache invalidation, or
     * other asynchronous operations.
     *
     * @returns A promise that resolves when the refresh operation is complete
     */
    readonly refresh: () => Promise<void>;
    /**
     * Function that exports the current state as a serializable snapshot.
     *
     * @remarks
     * This method creates a snapshot of the current state suitable for serialization,
     * persistence, or transmission. The snapshot format is defined by the TSnapshot type
     * parameter and is implementation-specific, potentially excluding non-serializable
     * values or including additional metadata.
     *
     * @returns A snapshot representation of the current state
     */
    readonly exportState: () => TSnapshot;
    /**
     * Registry object storing feature-specific APIs and state.
     *
     * @remarks
     * This object serves as a registry where each compiled feature can store its public API
     * and expose feature-specific functionality to other features or components. Each feature
     * is identified by a string key and can store any value type. The registry is created with
     * a null prototype to avoid prototype chain pollution.
     */
    readonly features: Record<string, unknown>;
    /**
     * Optional metadata object containing configuration information for the list.
     *
     * @remarks
     * This property provides access to optional metadata that may be used by features or
     * components for configuration purposes. Common metadata includes:
     * - `idKey`: The property name used as the unique identifier for rows
     * - `fields`: Field definitions or schema information for the list data
     *
     * The structure and content of metadata are not strictly defined and may vary based
     * on the specific list implementation and feature requirements.
     */
    readonly meta?: {
        idKey?: string;
        fields?: unknown;
    };
}

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
 * @public
 */
interface ListFeature<TRow = any, TRowId = any, TState = unknown, TSnapshot = unknown, TApi = unknown> {
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
    readonly order?: {
        before?: string[];
        after?: string[];
    };
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
    validate?: (ctx: {
        config: unknown;
        hasUI: boolean;
    }) => void;
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
    derive?: (rows: readonly TRow[], ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>) => readonly TRow[];
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

/**
 * Type alias for list features that include user interface rendering capabilities.
 *
 * @remarks
 * This type alias serves as a semantic marker for {@link ListFeature} implementations that
 * participate in the "ui" stage of the feature pipeline. While it is structurally identical
 * to the base {@link ListFeature} type, it provides improved code documentation and intent
 * clarity by explicitly indicating that the feature contributes visual components or rendering
 * logic to the list.
 *
 * Features typed as ListFeatureWithUI are expected to:
 * - Implement rendering logic in the "ui" stage (see {@link FeatureStage})
 * - Provide visual components, templates, or rendering modifications
 * - Execute after the "derive", "handlers", and "lifecycle" stages to ensure all data
 *   and event handlers are properly initialized before rendering
 *
 * The type alias does not enforce any additional runtime constraints or structural differences
 * beyond the base {@link ListFeature} interface. The distinction exists purely at the type level
 * to improve developer experience and code maintainability by making feature capabilities
 * explicit in type signatures.
 *
 * Common use cases include:
 * - Features that render custom UI elements or controls
 * - Features that modify the rendering pipeline or template structure
 * - Features that contribute visual feedback or decorations to list items
 * - Features that provide interactive UI components for data manipulation
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the feature's internal state object stored in {@link ListFeatureContext}
 * @typeParam TSnapshot - The type of the feature's serialized state representation for export/persistence
 * @typeParam TApi - The type of the public API object exposed by this feature to other features via the context's features registry
 *
 * @see {@link ListFeature} for the base feature interface definition
 * @see {@link ListFeatureContext} for the context object passed to features during execution
 * @see {@link FeatureStage} for information about the feature execution pipeline stages
 *
 * @public
 */
type ListFeatureWithUI<TRow = any, TRowId = any, TState = unknown, TSnapshot = unknown, TApi = unknown> = ListFeature<TRow, TRowId, TState, TSnapshot, TApi>;

/**
 * Defines the UI contract for features that render user interface components in the list feature system.
 *
 * @remarks
 * This contract specifies the UI integration requirements for features that participate in the rendering
 * layer during the "ui" stage of the feature pipeline. It provides a declarative interface for features to:
 * - Declare symbolic slot names where the feature expects to mount its components
 * - Specify required event handler or callback function identifiers that must be provided by consumers
 *
 * The UI contract is processed during feature compilation and used by the rendering system to:
 * - Validate that all required slots are available in the UI template
 * - Ensure all required handler functions are present in the rendering context
 * - Wire feature components to the correct mounting points in the component hierarchy
 * - Establish proper communication between features and their consuming applications
 *
 * Features declare their UI contract through this interface, and the list runtime validates and resolves
 * these requirements before rendering. This ensures a type-safe and predictable UI integration pattern
 * across all features in the system.
 *
 * @example
 * Basic UI contract for a feature with slots only:
 * ```typescript
 * const myFeature: ListFeature = {
 *   key: 'myFeature',
 *   ui: {
 *     slots: ['header', 'footer']
 *   }
 * };
 * ```
 *
 * @example
 * UI contract with both slots and required handlers:
 * ```typescript
 * const editableListFeature: ListFeature = {
 *   key: 'editableList',
 *   ui: {
 *     slots: ['actions', 'editor'],
 *     requiredHandlers: ['onSave', 'onCancel', 'onValidate']
 *   }
 * };
 * ```
 *
 * @see {@link FeatureStage} for information about the "ui" stage in the feature pipeline
 * @see {@link ListFeatureContext} for the context object available during UI rendering
 *
 * @public
 */
interface FeatureUIContract {
    /**
     * Optional array of symbolic slot identifiers where this feature expects to render its components.
     *
     * @remarks
     * Slot names act as semantic placeholders in the UI rendering system where feature-specific components
     * can be mounted during the "ui" stage of feature execution. Each string in this array represents a
     * named mounting point in the UI template hierarchy.
     *
     * **Slot Resolution Process:**
     * 1. Features declare slot requirements during feature definition
     * 2. UI framework integration layer validates slot availability during compilation
     * 3. Runtime rendering system resolves slot names to actual DOM mounting points
     * 4. Feature components are rendered into their designated slots
     *
     * **Slot Naming Conventions:**
     * - Use kebab-case or camelCase for consistency (e.g., 'row-actions' or 'rowActions')
     * - Choose semantic names that describe the purpose rather than position (e.g., 'actions' not 'right-panel')
     * - Avoid generic names like 'slot1' or 'container' that don't convey intent
     * - Use hierarchical naming for nested slots (e.g., 'header-left', 'header-right')
     *
     * **Slot Availability:**
     * The actual slot implementation and resolution is handled by the UI framework integration layer
     * (e.g., React, Vue, Angular adapters). If a feature declares slots that are not available in the
     * consuming application's template, the behavior depends on the framework integration:
     * - Strict mode: Throws validation error during feature compilation
     * - Lenient mode: Silently ignores missing slots or logs warnings
     *
     * Slots provide loose coupling between features and their rendering contexts, allowing features
     * to be composed into different UI layouts without modification.
     *
     * @example
     * Simple slot declaration for a toolbar feature:
     * ```typescript
     * {
     *   slots: ['toolbar-left', 'toolbar-right']
     * }
     * ```
     *
     * @example
     * Multiple slots for a complex grid feature:
     * ```typescript
     * {
     *   slots: [
     *     'header',
     *     'filters',
     *     'actions',
     *     'row-expander',
     *     'footer',
     *     'pagination'
     *   ]
     * }
     * ```
     *
     * @example
     * Hierarchical slot names for nested components:
     * ```typescript
     * {
     *   slots: [
     *     'card-header-left',
     *     'card-header-right',
     *     'card-body',
     *     'card-footer-actions'
     *   ]
     * }
     * ```
     */
    slots?: string[];
    /**
     * Optional array of handler function identifiers that must be provided by the consuming application
     * when this feature's UI is rendered.
     *
     * @remarks
     * These handler names establish a strict contract between the feature and its consumers, ensuring
     * that all necessary callback functions or event handlers exist in the rendering context before
     * the feature UI is displayed. This validation mechanism prevents runtime errors from missing
     * handlers and makes feature integration requirements explicit and enforceable.
     *
     * **Handler Validation Process:**
     * 1. Feature declares required handlers during feature definition
     * 2. List runtime validates handler presence during feature compilation or initialization
     * 3. If validation fails, compilation throws an error with details about missing handlers
     * 4. If validation succeeds, feature can safely invoke handlers during execution
     *
     * **Handler Naming Conventions:**
     * - Use camelCase for consistency with JavaScript conventions (e.g., 'onRowSelect')
     * - Prefix event handlers with 'on' to indicate callback nature (e.g., 'onClick', 'onChange')
     * - Use descriptive names that convey the handler's purpose and timing
     * - Include the subject of the handler in the name (e.g., 'onRowClick' not 'onClick')
     *
     * **Handler Sources:**
     * Required handlers are typically provided through:
     * - Props passed to the list component from parent components
     * - Configuration objects provided during list initialization
     * - Context objects from the UI framework (React Context, Vue provide/inject, etc.)
     * - Feature-specific configuration during feature composition
     *
     * **Error Handling:**
     * When required handlers are missing:
     * - Development mode: Throws descriptive error with missing handler names
     * - Production mode: May throw error or use fallback no-op handlers depending on configuration
     * - Type systems (TypeScript): Can provide compile-time validation when properly typed
     *
     * **Best Practices:**
     * - Only declare handlers as required if they are essential for feature operation
     * - Document expected handler signatures in feature documentation
     * - Provide default or fallback handlers in the feature when possible to reduce requirements
     * - Consider making handlers optional and checking for existence before invocation for better flexibility
     *
     * Declaring required handlers ensures proper integration and prevents silent failures when features
     * expect interaction capabilities that are not provided by the consuming application.
     *
     * @example
     * Basic required handlers for a selectable list:
     * ```typescript
     * {
     *   requiredHandlers: ['onRowSelect', 'onRowDeselect']
     * }
     * ```
     *
     * @example
     * Comprehensive handlers for an editable data grid:
     * ```typescript
     * {
     *   requiredHandlers: [
     *     'onRowSelect',
     *     'onRowEdit',
     *     'onRowSave',
     *     'onRowCancel',
     *     'onRowDelete',
     *     'onValidate',
     *     'onError'
     *   ]
     * }
     * ```
     *
     * @example
     * Handlers for a filterable and sortable list:
     * ```typescript
     * {
     *   requiredHandlers: [
     *     'onFilterChange',
     *     'onSortChange',
     *     'onPageChange',
     *     'onRefresh'
     *   ]
     * }
     * ```
     *
     * @example
     * Handlers with specific event semantics:
     * ```typescript
     * {
     *   requiredHandlers: [
     *     'onBeforeRowSelect',  // Called before selection changes
     *     'onRowSelect',         // Called when selection changes
     *     'onAfterRowSelect',    // Called after selection is finalized
     *     'onRowSelectError'     // Called if selection fails validation
     *   ]
     * }
     * ```
     */
    requiredHandlers?: string[];
}

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
interface CompiledFeaturePlan<TRow = any> {
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
    derivePipeline: Array<(rows: readonly TRow[], ctx: ListFeatureContext<TRow>) => readonly TRow[]>;
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
 * Registry interface for managing and compiling list features into an executable plan.
 *
 * @remarks
 * The FeatureRegistry serves as a centralized container for registering list features and
 * orchestrating their compilation into an optimized execution plan. It provides a fluent API
 * for feature registration and handles the complex process of resolving feature dependencies,
 * ordering features by stage, and building a {@link CompiledFeaturePlan} that coordinates
 * feature execution across all lifecycle stages.
 *
 * The registry implements a two-phase pattern:
 *
 * **Phase 1: Registration** - Features are registered using {@link FeatureRegistry.register}.
 * During this phase, features are collected but not yet resolved or ordered. This allows
 * features to be added in any sequence regardless of their dependencies.
 *
 * **Phase 2: Compilation** - When {@link FeatureRegistry.compile} is invoked with a
 * {@link ListFeatureContext}, the registry performs topological sorting to resolve feature
 * dependencies, groups features by their execution stage (derive, handlers, lifecycle, ui),
 * and constructs a {@link CompiledFeaturePlan} that defines the complete execution order.
 *
 * Type parameters enable type-safe feature registration and compilation:
 * - Features registered must match the registry's type parameters
 * - Compilation context must provide compatible type parameters
 * - The resulting plan maintains type safety for row transformations
 *
 * Typical usage workflow:
 * ```typescript
 * const registry = createFeatureRegistry<MyRow, string>();
 * registry
 *   .register(sortingFeature)
 *   .register(filteringFeature)
 *   .register(paginationFeature);
 *
 * const plan = registry.compile(context);
 * // plan now contains ordered features ready for execution
 * ```
 *
 * The registry ensures that features are executed in the correct stage order
 * (derive → handlers → lifecycle → ui) as defined by {@link FeatureStage}, and within
 * each stage, features are ordered according to their declared dependencies.
 *
 * @typeParam TRow - The type of data objects (rows) in the list. Defaults to `any` for maximum flexibility.
 * @typeParam TRowId - The type of unique identifiers for rows. Defaults to `any` to support various ID types.
 * @typeParam TState - The type of the list's state object. Defaults to `unknown` for untyped state.
 * @typeParam TSnapshot - The type of state snapshots used for undo/history features. Defaults to `unknown`.
 *
 * @see {@link ListFeatureWithUI} for the feature interface that can be registered
 * @see {@link ListFeatureContext} for the context object passed during compilation
 * @see {@link CompiledFeaturePlan} for the output of the compilation process
 * @see {@link FeatureStage} for the execution stages used during compilation
 *
 * @public
 */
interface FeatureRegistry<TRow = any, TRowId = any, TState = unknown, TSnapshot = unknown> {
    /**
     * Registers a list feature with the registry for inclusion in the compiled execution plan.
     *
     * @remarks
     * This method adds a feature to the registry's internal collection. Features can be registered
     * in any order; dependency resolution and execution ordering are deferred until the
     * {@link FeatureRegistry.compile} method is called.
     *
     * The method implements a fluent interface pattern, returning the registry instance to allow
     * method chaining for convenient registration of multiple features:
     *
     * ```typescript
     * registry
     *   .register(featureA)
     *   .register(featureB)
     *   .register(featureC);
     * ```
     *
     * Features must conform to the {@link ListFeatureWithUI} interface and provide compatible
     * type parameters matching the registry's generic types. Type mismatches will result in
     * compilation errors, ensuring type safety throughout the feature pipeline.
     *
     * Registered features can contribute to any combination of execution stages (derive, handlers,
     * lifecycle, ui) by implementing the corresponding methods in their feature definition. The
     * registry does not validate or execute features during registration; this occurs during
     * the compilation phase.
     *
     * @param feature - The list feature instance to register. Must implement {@link ListFeatureWithUI}
     * with type parameters compatible with the registry's generic types.
     *
     * @returns The registry instance for method chaining.
     *
     * @see {@link ListFeatureWithUI} for the feature interface structure
     * @see {@link FeatureRegistry.compile} for the compilation phase where registered features are processed
     */
    register(feature: ListFeatureWithUI<TRow, TRowId, TState, TSnapshot, any>): this;
    /**
     * Compiles all registered features into an optimized, ordered execution plan.
     *
     * @remarks
     * This method transforms the collection of registered features into a {@link CompiledFeaturePlan}
     * that defines the complete execution order and coordination across all feature stages. The
     * compilation process performs several critical operations:
     *
     * 1. **Dependency Resolution** - Analyzes feature dependencies declared via `dependsOn` arrays
     *    and performs topological sorting to determine a valid execution order that respects all
     *    dependency constraints.
     *
     * 2. **Stage Grouping** - Organizes features into their respective execution stages as defined
     *    by {@link FeatureStage}: derive, handlers, lifecycle, and ui. Features are processed in
     *    this stage order during execution.
     *
     * 3. **Plan Generation** - Constructs a {@link CompiledFeaturePlan} containing ordered feature
     *    references, stage-specific execution sequences, and any metadata needed for coordinated
     *    feature execution.
     *
     * The compilation process is deterministic and idempotent given the same set of registered
     * features and context. The resulting plan can be executed multiple times without requiring
     * recompilation unless features are added or removed from the registry.
     *
     * The provided context object supplies the necessary runtime information for compilation,
     * including access to the list's current state, metadata, and configuration. Features may
     * inspect the context during compilation to make initialization decisions, though actual
     * feature execution occurs later when the plan is run.
     *
     * If circular dependencies are detected during topological sorting, the compilation process
     * will fail with an error indicating which features are involved in the cycle. All feature
     * dependencies must form a directed acyclic graph (DAG).
     *
     * @param ctx - The list feature context providing access to state, metadata, and configuration
     * required for feature compilation. Must have type parameters compatible with the registry.
     *
     * @returns A compiled feature plan containing the ordered and grouped features ready for
     * execution across all stages of the feature pipeline.
     *
     * @see {@link ListFeatureContext} for the context structure and available properties
     * @see {@link CompiledFeaturePlan} for the structure of the returned execution plan
     * @see {@link FeatureStage} for the execution stages used during compilation
     */
    compile(ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot>): CompiledFeaturePlan<TRow>;
}

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
 * @public
 */
type ListStatus = "idle" | "loading" | "ready" | "error";
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
 * @public
 */
type FeatureStateBag = Record<string, unknown>;
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
 * @public
 */
interface CoreListState<TRow = any> {
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
    featureState: FeatureStateBag;
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
type DataSourceInitResult<TRow> = {
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
type DataSource<TRow, TPatch = unknown> = {
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
type ApplyPatchFn<TRow, TPatch> = (rows: TRow[], patch: TPatch) => TRow[];

/**
 * Type definition for the slots registry that maps slot names to React component types.
 *
 * @remarks
 * This type represents a flexible registry for list UI component slots, allowing features
 * to register and access React components dynamically. Each slot is identified by a string
 * key and contains either a React component or undefined if the slot is not populated.
 *
 * The record structure supports:
 * - Built-in slot names (see {@link BuiltInSlotNames}) for standard list UI elements
 * - Custom arbitrary slot names defined by features or implementations
 * - Optional slots (undefined values) for conditional UI elements
 *
 * Slots are typically populated during the "ui" feature stage (see {@link FeatureStage})
 * and consumed by rendering components to compose the complete list interface. Features
 * can register components for specific slots to extend or customize the list UI without
 * modifying core rendering logic.
 *
 * Common usage patterns:
 * - Features register components: `slots.Toolbar = MyToolbarComponent`
 * - Renderers consume components: `const Toolbar = slots.Toolbar`
 * - Conditional rendering: `{slots.LoadingState && <slots.LoadingState />}`
 *
 * @typeParam key - String identifier for the slot (supports both built-in and custom names)
 * @typeParam value - React component type accepting any props, or undefined for empty slots
 *
 * @see {@link BuiltInSlotNames} for standard slot name definitions
 * @see {@link FeatureStage} for the UI stage where slots are typically populated
 *
 * @public
 */
type ListSlots = Record<string, ComponentType<any> | undefined>;

/**
 * Props interface for the ListDisplay component.
 *
 * @remarks
 * This is the main configuration interface for the ListDisplay component, which is the
 * central component of the library. It defines all necessary properties including data
 * management, feature registry, UI components, and optional optimizations.
 *
 * @typeParam TRow - The type of row data being displayed in the list
 * @typeParam TRowId - The type of the unique identifier for each row
 * @typeParam TPatch - The type of patch data used for optimistic updates
 *
 * @public
 */
type ListDisplayProps<TRow = any, TRowId = any, TPatch = unknown> = {
    /**
     * The key name used to uniquely identify each row in the data.
     *
     * @remarks
     * This property specifies which field in your row data serves as the unique identifier.
     * It's used internally for efficient row tracking and updates.
     *
     * @example
     * ```typescript
     * idKey: "id"
     * idKey: "userId"
     * ```
     */
    idKey: string;
    /**
     * The field schema definition for the list columns.
     *
     * @remarks
     * This property defines the structure and metadata of the fields/columns in your list.
     * The exact type will be tightened to FieldSchema<TRow>[] in future versions.
     * Currently accepts any field definition structure.
     */
    fields: unknown;
    /**
     * The data source provider for fetching and managing list data.
     *
     * @remarks
     * This is a required function or object that defines how the list fetches its data.
     * It handles initial data loading, refreshes, and any server communication.
     * The data source is the primary input for the list's data pipeline.
     */
    dataSource: DataSource<TRow, TPatch>;
    /**
     * Optional function to apply optimistic patch updates to rows.
     *
     * @remarks
     * When provided, this function enables optimistic updates by applying patch data
     * to existing rows before the server confirms the changes. This improves perceived
     * performance by immediately reflecting user actions in the UI.
     */
    applyPatch?: ApplyPatchFn<TRow, TPatch>;
    /**
     * The feature registry containing all registered list features.
     *
     * @remarks
     * This is the core registry that defines what capabilities your list has, such as
     * filtering, sorting, pagination, etc. The registry must be created and configured
     * before being passed to ListDisplay.
     *
     */
    registry: FeatureRegistry<TRow, TRowId>;
    /**
     * Optional UI component slots to customize the list's appearance.
     *
     * @remarks
     * Provide custom React components for various parts of the list UI such as
     * Table, Toolbar, FiltersPanel, Pagination, etc. Any slot not provided will
     * simply not be rendered, allowing for flexible layouts.
     */
    components?: ListSlots;
    /**
     * Optional props to pass to each component slot.
     *
     * @remarks
     * This object allows you to pass additional props to your custom components.
     * Keys should match the component slot names (e.g., "Table", "Toolbar").
     */
    componentsProps?: Record<string, unknown>;
    /**
     * UI wiring validation behavior mode.
     *
     * @remarks
     * Controls how the library validates that required UI handlers are properly wired.
     * - "throw": Throws an error if validation fails (recommended for development)
     * - "warn": Logs a warning if validation fails (recommended for production)
     *
     * @defaultValue "throw"
     */
    validationMode?: "throw" | "warn";
    /**
     * Optional initial rows for instant first paint optimization.
     *
     * @remarks
     * When provided, these rows will be displayed immediately without waiting for
     * the data source to load. This is useful for server-side rendering or when
     * you already have data available. The list status will be set to "ready"
     * instead of "idle" when initial rows are provided.
     */
    initialRows?: TRow[];
};
/**
 * The main component of the library where all functionality comes together.
 *
 * @remarks
 * ListDisplay is the central orchestrator component that integrates all parts of the list
 * management system. It manages:
 * - Internal state store creation and subscription
 * - Feature registry compilation and runtime initialization
 * - Data source connection and patch application
 * - Lifecycle management (init/destroy) for all features
 * - Derivation pipeline execution (filtering, sorting, pagination, etc.)
 * - UI rendering with customizable component slots
 * - Development-time validation of UI wiring
 *
 * This component creates an isolated list instance with its own internal state management.
 * Parent components remain unaffected by internal state changes. All list features are
 * executed in the correct order as defined by the feature registry, and their APIs are
 * made available through the ListContext to child components.
 *
 * The component handles different loading states automatically and renders appropriate
 * UI based on the current status (loading, error, empty, or ready with data).
 *
 * @typeParam TRow - The type of row data being displayed
 * @typeParam TRowId - The type of the unique identifier for each row
 * @typeParam TPatch - The type of patch data for optimistic updates
 *
 * @param props - Configuration props for the list display
 *
 * @returns A React component that renders the complete list UI
 *
 * @example
 * Basic usage with features:
 * ```typescript
 * import { ListDisplay } from './ListDisplay';
 * import { createRegistry } from './core/registry';
 * import { filteringFeature } from './features/filtering';
 *
 * const registry = createRegistry<User, string>();
 * registry.register(filteringFeature({ apply: myFilterFn }));
 *
 * function MyList() {
 *   return (
 *     <ListDisplay
 *       idKey="id"
 *       fields={fields}
 *       dataSource={fetchUsers}
 *       registry={registry}
 *       components={{ Table: MyTable, Toolbar: MyToolbar }}
 *     />
 *   );
 * }
 * ```
 *
 *
 * @public
 */
declare function ListDisplay<TRow = any, TRowId = any, TPatch = unknown>(props: ListDisplayProps<TRow, TRowId, TPatch>): react_jsx_runtime.JSX.Element;

/**
 * Context object provided to general action handlers containing list state and utility methods.
 *
 * @public
 * @typeParam TRow - The row data type
 */
type GeneralActionHandlerContext<TRow = any> = {
    /**
     * Visible rows after all transformations (filtering, sorting, pagination) have been applied.
     */
    rowsVisible: readonly TRow[];
    /**
     * Raw rows before any derive pipeline transformations.
     */
    rowsAll: readonly TRow[];
    /**
     * Optional selection snapshot if the selection feature is registered.
     * The shape depends on the selection feature implementation.
     */
    selection?: unknown;
    /**
     * Safely updates the raw rows by providing an updater function.
     *
     * @param updater - Function that receives current rows and returns updated rows
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;
    /**
     * Triggers a refresh of the list data.
     *
     * @returns Promise that resolves when refresh is complete
     */
    refresh: () => Promise<void>;
    /**
     * Exports the current state of the list.
     *
     * @returns The exported state object
     */
    exportState: () => unknown;
    /**
     * Registry of all registered feature APIs.
     */
    features: Record<string, unknown>;
    /**
     * Metadata about the list configuration.
     */
    meta: {
        /**
         * The property name used as unique identifier for rows.
         */
        idKey: string;
        /**
         * Optional field definitions or schema.
         */
        fields?: unknown;
    };
};
/**
 * Defines a general action that can be triggered on the list.
 *
 * @public
 */
type GeneralAction = {
    /**
     * Unique identifier for the action.
     */
    id: string;
    /**
     * Optional human-readable label for the action.
     */
    label?: string;
    /**
     * Optional predicate to determine if the action is currently enabled.
     *
     * @param ctx - Read-only context without updateRows capability
     * @returns True if the action should be enabled, false otherwise
     */
    isEnabled?: (ctx: Omit<GeneralActionHandlerContext<any>, "updateRows">) => boolean;
    /**
     * Optional modal request factory. If defined, triggering the action will open a modal.
     * The scope and actionId are automatically injected by the feature.
     *
     * @param ctx - Read-only context without updateRows capability
     * @returns Modal request configuration with optional metadata
     */
    modal?: (ctx: Omit<GeneralActionHandlerContext<any>, "updateRows">) => {
        /**
         * Optional metadata to pass to the modal.
         */
        meta?: Record<string, unknown>;
    };
    /**
     * The action handler function that executes the action logic.
     *
     * @param ctx - Full action context including updateRows capability
     * @param payload - Optional payload data, typically from modal confirmation
     * @returns Optional promise for async operations
     */
    handler: (ctx: GeneralActionHandlerContext<any>, payload?: unknown) => void | Promise<void>;
};
/**
 * Public API exposed by the general actions feature.
 *
 * @public
 */
type GeneralActionsApi = {
    /**
     * Retrieves all registered general actions.
     *
     * @returns Read-only array of all general actions
     */
    getActions: () => ReadonlyArray<GeneralAction>;
    /**
     * Triggers a general action by its ID.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @returns Promise that resolves when the action completes or modal opens
     */
    trigger: (actionId: string) => Promise<void>;
};
/**
 * Creates a general actions feature that enables triggering custom actions on the list.
 *
 * This feature allows defining actions that can be executed on the entire list,
 * with optional modal confirmation dialogs. Actions can access list state, modify rows,
 * and integrate with other features like selection.
 *
 * @public
 * @typeParam TRow - The row data type
 * @param options - Configuration options for the feature
 * @returns A list feature with UI slots and action trigger capabilities
 * @throws Error if actions array is not provided or if idKey is missing from context metadata
 *
 * @example
 * ```typescript
 * const feature = generalActionsFeature({
 *   actions: [
 *     {
 *       id: 'delete-all',
 *       label: 'Delete All',
 *       modal: () => ({ meta: { title: 'Confirm Delete' } }),
 *       handler: async (ctx) => {
 *         ctx.updateRows(() => []);
 *       }
 *     }
 *   ]
 * });
 * ```
 */
declare function generalActionsFeature<TRow = any>(options: {
    actions: Array<GeneralAction>;
}): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, GeneralActionsApi>;

/**
 * Represents a modal request configuration for row actions.
 *
 * @public
 */
type ModalRequest = {
    /**
     * Optional metadata to be passed to the modal.
     */
    meta?: Record<string, unknown>;
};
/**
 * The handler context passed to a row action when it is executed.
 * Provides access to the current row, visible and raw row data, selection state,
 * state mutation methods, and feature APIs.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
type RowActionHandlerContext<TRow = any, TRowId = any> = {
    /**
     * The current row data object being acted upon.
     */
    row: TRow;
    /**
     * The unique identifier of the current row.
     */
    rowId: TRowId;
    /**
     * The zero-based index of the current row within the visible rows array.
     */
    rowIndex: number;
    /**
     * All visible rows after filtering, sorting, and pagination have been applied.
     */
    rowsVisible: readonly TRow[];
    /**
     * All raw rows before any derive pipeline transformations have been applied.
     */
    rowsAll: readonly TRow[];
    /**
     * Optional selection feature snapshot, populated if the selection plugin is registered.
     */
    selection?: unknown;
    /**
     * Safely updates the raw rows state using an updater function.
     *
     * @param updater - A function that receives the current raw rows array and returns the updated array
     */
    updateRows: (updater: (current: TRow[]) => TRow[]) => void;
    /**
     * Triggers a refresh of the list data.
     *
     * @returns A promise that resolves when the refresh is complete
     */
    refresh: () => Promise<void>;
    /**
     * Exports the current list state.
     *
     * @returns The exported state object
     */
    exportState: () => unknown;
    /**
     * Namespace containing all registered feature APIs.
     */
    features: Record<string, unknown>;
    /**
     * Metadata about the list configuration.
     */
    meta: {
        /**
         * The property name used as the unique identifier for rows.
         */
        idKey: string;
        /**
         * Optional field definitions or metadata.
         */
        fields?: unknown;
    };
};
/**
 * Defines a row action that can be executed on individual rows within the list.
 * Actions can optionally present a modal for user confirmation before execution.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
type RowAction<TRow = any, TRowId = any> = {
    /**
     * Unique identifier for the row action.
     */
    id: string;
    /**
     * Optional human-readable label for the action.
     */
    label?: string;
    /**
     * Optional availability guard that determines if the action should be enabled for a given row.
     *
     * @param ctx - The row action context without the updateRows method
     * @returns `true` if the action should be enabled, `false` otherwise
     */
    isEnabled?: (ctx: Omit<RowActionHandlerContext<TRow, TRowId>, "updateRows">) => boolean;
    /**
     * Optional modal descriptor factory. If provided, the action will open a modal for user confirmation
     * before executing the handler. The modal's confirmation payload will be passed to the handler.
     *
     * @param ctx - The row action context without the updateRows method
     * @returns A modal request configuration
     */
    modal?: (ctx: Omit<RowActionHandlerContext<TRow, TRowId>, "updateRows">) => ModalRequest;
    /**
     * The actual action handler that performs the row action logic.
     * If a modal is configured, this handler runs only after user confirmation.
     *
     * @param ctx - The complete row action handler context
     * @param payload - Optional payload data, typically from modal confirmation
     * @returns A promise if the action is asynchronous, or void for synchronous actions
     */
    handler: (ctx: RowActionHandlerContext<TRow, TRowId>, payload?: unknown) => void | Promise<void>;
};
/**
 * Public API for the row actions feature, providing methods to retrieve and trigger row actions.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
type RowActionsApi<TRow = any, TRowId = any> = {
    /**
     * Retrieves all registered row actions.
     *
     * @returns A read-only array of row actions
     */
    getActions: () => ReadonlyArray<RowAction<TRow, TRowId>>;
    /**
     * Triggers a row action using a visible row index.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @param rowIndex - The zero-based index of the row within the visible rows array
     * @returns A promise that resolves when the action completes
     */
    triggerAt: (actionId: string, rowIndex: number) => Promise<void>;
    /**
     * Triggers a row action using a row identifier.
     * The row index will be resolved against the visible rows array.
     *
     * @param actionId - The unique identifier of the action to trigger
     * @param rowId - The unique identifier of the target row
     * @returns A promise that resolves when the action completes
     */
    triggerById: (actionId: string, rowId: TRowId) => Promise<void>;
};
/**
 * Configuration options for the row actions feature.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @public
 */
type RowActionsFeatureOptions<TRow = any, TRowId = any> = {
    /**
     * Array of row actions to be registered with the feature.
     */
    actions: Array<RowAction<TRow, TRowId>>;
};
/**
 * Creates a row actions feature that enables defining and executing actions on individual rows.
 * Row actions can optionally integrate with the modals feature for user confirmation dialogs.
 * The feature provides methods to trigger actions by row index or row ID, and automatically
 * manages action availability, modal workflows, and state updates.
 *
 * @remarks
 * This feature requires:
 * - `ctx.meta.idKey` to be defined as a string property name for row identification
 * - The modals feature to be registered if any actions use the `modal` option
 *
 * The feature automatically subscribes to modal resolution events and cleans up subscriptions
 * during destruction.
 *
 * @typeParam TRow - The type of row data objects
 * @typeParam TRowId - The type of row identifier values
 *
 * @param options - Configuration options including the array of row actions
 * @returns A list feature with UI integration and row actions API
 *
 * @throws Error if options.actions is not provided
 * @throws Error if ctx.meta.idKey is not defined during feature creation
 * @throws Error if an action requests a modal but the modals feature is not registered
 *
 * @public
 */
declare function rowActionsFeature<TRow = any, TRowId = any>(options: RowActionsFeatureOptions<TRow, TRowId>): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, RowActionsApi<TRow, TRowId>>;

/**
 * Represents the filters value that can be of any type.
 *
 * @remarks
 * This type is intentionally kept as unknown to allow maximum flexibility in filter implementations.
 * Consumers should cast this to their specific filter structure.
 *
 * @public
 */
type FiltersValue = unknown;
/**
 * Function type for applying filters to a collection of rows.
 *
 * @remarks
 * This function defines the filtering strategy and is called during the derive phase
 * to filter the rows based on the current filter values. The implementation is
 * completely custom and library-agnostic.
 *
 * @typeParam TRow - The type of row data being filtered
 *
 * @param rows - The readonly array of rows to be filtered
 * @param filters - The current filter values to apply
 * @param ctx - The list feature context providing access to state and utilities
 *
 * @returns A readonly array of filtered rows
 *
 * @public
 */
type FilteringApplyFn<TRow = any> = (rows: readonly TRow[], filters: FiltersValue, ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>) => readonly TRow[];
/**
 * Configuration options for the filtering feature.
 *
 * @remarks
 * These options define how the filtering feature behaves, including the filtering
 * logic and initial filter state. The library remains agnostic to the actual
 * filtering implementation.
 *
 * @typeParam TRow - The type of row data being filtered
 *
 * @public
 */
type FilteringFeatureOptions<TRow = any> = {
    /**
     * The filtering strategy function that applies filters to rows.
     *
     * @remarks
     * This is a required function that implements your custom filtering logic.
     * The library does not impose any specific filtering algorithm.
     */
    apply: FilteringApplyFn<TRow>;
    /**
     * The initial filter values to use when the feature is first created.
     *
     * @remarks
     * If not provided, defaults to an empty object.
     */
    initial?: FiltersValue;
};
/**
 * API interface for managing filters in a list.
 *
 * @remarks
 * This interface provides methods to get, set, and clear filter values.
 * It is returned by the filtering feature and can be used by UI components
 * or other features to interact with the filtering state.
 *
 * @public
 */
type FilteringApi = {
    /**
     * Retrieves the current filter values.
     *
     * @returns The current filters value
     */
    getFilters: () => FiltersValue;
    /**
     * Sets new filter values.
     *
     * @remarks
     * Can accept either a direct value or a function that receives the previous
     * filters and returns the new filters. This allows for both direct updates
     * and updates based on the current state.
     *
     * @param next - The new filters value or a function to compute it from the previous value
     */
    setFilters: (next: FiltersValue | ((prev: FiltersValue) => FiltersValue)) => void;
    /**
     * Resets the filters to their initial values.
     *
     * @remarks
     * This will set the filters back to the value specified in the `initial` option,
     * or to an empty object if no initial value was provided.
     */
    clearFilters: () => void;
};
/**
 * Creates a filtering feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds filtering capabilities to a list.
 * It provides an API for managing filter state and automatically applies filters
 * during the derive phase. The feature includes UI slots for filter panels and
 * requires setFilters handler to be implemented.
 *
 * The filtering logic is completely customizable through the `apply` function,
 * allowing you to implement any filtering strategy that fits your needs.
 *
 * @typeParam TRow - The type of row data being filtered
 *
 * @param options - Configuration options for the filtering feature
 *
 * @returns A list feature with UI support that provides filtering capabilities
 *
 * @throws Error if the `apply` function is not provided in options
 *
 * @example
 * ```typescript
 * const filtering = filteringFeature({
 *   apply: (rows, filters) => rows.filter(row => row.name.includes(filters.search)),
 *   initial: { search: '' }
 * });
 * ```
 *
 * @public
 */
declare function filteringFeature<TRow = any>(options: FilteringFeatureOptions<TRow>): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, FilteringApi>;

/**
 * Defines the context in which a modal was opened.
 *
 * @remarks
 * This type categorizes modal origins to maintain generic modal implementations
 * while still supporting specific action contexts. The scope helps other features
 * (like actions) understand how to handle modal results.
 *
 * - `row-action`: Modal opened from an action on a specific row
 * - `general-action`: Modal opened from a general action not tied to a specific row
 * - `custom`: Modal opened from custom application logic
 *
 * @public
 */
type ModalScope = "row-action" | "general-action" | "custom";
/**
 * Describes a modal's configuration and context.
 *
 * @remarks
 * This descriptor contains all information needed to display and track a modal.
 * It intentionally keeps the modal system generic by using a flexible metadata
 * structure while providing optional correlation identifiers.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
type ModalDescriptor<TRowId = any> = {
    /**
     * The context in which the modal was opened.
     */
    scope: ModalScope;
    /**
     * Optional identifier for the action that triggered the modal.
     *
     * @remarks
     * This allows features like the actions plugin to correlate modal results
     * back to the originating action.
     */
    actionId?: string;
    /**
     * Optional identifier for the row associated with the modal.
     *
     * @remarks
     * Relevant when scope is "row-action", allowing the modal to reference
     * the specific row being acted upon.
     */
    rowId?: TRowId;
    /**
     * Flexible metadata for the modal implementation.
     *
     * @remarks
     * Consumers can provide any data needed by their ModalOutlet UI component,
     * such as title, message, form schema, validation rules, etc. The structure
     * is intentionally open-ended to support various modal types.
     */
    meta?: Record<string, unknown>;
};
/**
 * Represents the result of a modal interaction.
 *
 * @remarks
 * This discriminated union type captures the outcome of a modal, either confirmed
 * with optional payload data or cancelled. The descriptor is included in both cases
 * to maintain context about which modal was resolved.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
type ModalResult<TRowId = any> = {
    /**
     * Indicates the modal was confirmed by the user.
     */
    status: "confirmed";
    /**
     * The original modal descriptor that was resolved.
     */
    descriptor: ModalDescriptor<TRowId>;
    /**
     * Optional data returned from the modal (e.g., form values, user selections).
     */
    payload?: unknown;
} | {
    /**
     * Indicates the modal was cancelled by the user.
     */
    status: "cancelled";
    /**
     * The original modal descriptor that was resolved.
     */
    descriptor: ModalDescriptor<TRowId>;
};
/**
 * API interface for managing modals in a list.
 *
 * @remarks
 * This interface provides methods to open, close, and resolve modals, as well as
 * subscribe to resolution events. It is returned by the modals feature and can be
 * used by UI components or other features to interact with modal state.
 *
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @public
 */
type ModalsApi<TRowId = any> = {
    /**
     * Retrieves the currently active modal descriptor.
     *
     * @returns The active modal descriptor, or undefined if no modal is open
     */
    getActive: () => ModalDescriptor<TRowId> | undefined;
    /**
     * Opens a modal with the specified descriptor.
     *
     * @remarks
     * By default, this replaces any currently open modal. If strictSingle mode
     * is enabled in feature options, attempting to open a modal while one is
     * active will throw an error.
     *
     * @param descriptor - The modal descriptor containing configuration and context
     *
     * @throws Error if strictSingle is enabled and a modal is already active
     */
    open: (descriptor: ModalDescriptor<TRowId>) => void;
    /**
     * Closes the current modal without resolving it.
     *
     * @remarks
     * This is rarely needed but useful for edge cases like navigation away from
     * the list or programmatic dismissal. Does nothing if no modal is active.
     * Subscribers will not be notified as this is not a resolution.
     */
    close: () => void;
    /**
     * Resolves the current modal as confirmed with optional payload.
     *
     * @remarks
     * This closes the modal, stores the confirmation result, and notifies all
     * subscribers. Does nothing if no modal is active.
     *
     * @param payload - Optional data to include with the confirmation result
     */
    confirm: (payload?: unknown) => void;
    /**
     * Resolves the current modal as cancelled.
     *
     * @remarks
     * This closes the modal, stores the cancellation result, and notifies all
     * subscribers. Does nothing if no modal is active.
     */
    cancel: () => void;
    /**
     * Subscribes to modal resolution events.
     *
     * @remarks
     * The listener will be called whenever a modal is confirmed or cancelled
     * (but not when closed without resolution). This is useful for features
     * like actions that need to respond to modal outcomes.
     *
     * @param listener - Function to call when a modal is resolved
     *
     * @returns A function that unsubscribes the listener when called
     */
    onResolve: (listener: (result: ModalResult<TRowId>) => void) => () => void;
};
/**
 * Configuration options for the modals feature.
 *
 * @remarks
 * These options control the behavior of the modals feature, including
 * how multiple modal requests are handled.
 *
 * @public
 */
type ModalsFeatureOptions = {
    /**
     * Enforces strict single-modal behavior.
     *
     * @remarks
     * When enabled, attempting to open a modal while one is already active
     * will throw an error instead of replacing the existing modal. This can
     * help catch programming errors where multiple modals are unintentionally
     * triggered.
     *
     * @defaultValue false - By default, opening a new modal replaces any active modal
     */
    strictSingle?: boolean;
};
/**
 * Creates a modals feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds modal management capabilities to a list.
 * It provides an API for opening, closing, and resolving modals, as well as subscribing
 * to modal resolution events. The feature includes UI slots for modal outlets and
 * requires specific handlers to be implemented by the UI layer.
 *
 * The modal system is intentionally generic, using flexible descriptors and metadata
 * to support various modal types while maintaining integration with other features
 * like actions through correlation identifiers.
 *
 * Only one modal can be active at a time, though this behavior can be made stricter
 * with the strictSingle option.
 *
 * @typeParam TRow - The type of row data in the list
 * @typeParam TRowId - The type of row identifier used in the list
 *
 * @param options - Configuration options for the modals feature
 *
 * @returns A list feature with UI support that provides modal management capabilities
 *
 * @example
 * ```typescript
 * const modals = modalsFeature({
 *   strictSingle: true
 * });
 *
 * // Later in your code
 * modals.open({
 *   scope: 'row-action',
 *   actionId: 'delete',
 *   rowId: '123',
 *   meta: {
 *     title: 'Confirm Delete',
 *     message: 'Are you sure you want to delete this item?'
 *   }
 * });
 *
 * modals.onResolve((result) => {
 *   if (result.status === 'confirmed') {
 *     // Handle confirmation
 *   }
 * });
 * ```
 *
 * @public
 */
declare function modalsFeature<TRow = any, TRowId = any>(options?: ModalsFeatureOptions): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, ModalsApi<TRowId>>;

/**
 * Internal state slice for the pagination feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the pagination feature. It is stored in the global list state under the
 * feature's ID and contains all pagination-related metadata.
 *
 * @public
 */
type PaginationSlice = {
    /**
     * The current zero-based page index.
     *
     * @remarks
     * This value is automatically constrained to be within valid bounds (0 to totalPages - 1).
     */
    pageIndex: number;
    /**
     * The number of items to display per page.
     *
     * @remarks
     * This value must be at least 1 and is used to calculate the total number of pages.
     */
    pageSize: number;
    /**
     * The total number of items across all pages.
     *
     * @remarks
     * This value is automatically calculated based on the number of rows after filtering and sorting.
     */
    totalItems: number;
    /**
     * The total number of pages based on the page size and total items.
     *
     * @remarks
     * This value is automatically calculated as Math.ceil(totalItems / pageSize) with a minimum of 1.
     */
    totalPages: number;
};
/**
 * API interface for managing pagination in a list.
 *
 * @remarks
 * This interface provides methods to get and update pagination state.
 * It is returned by the pagination feature and can be used by UI components
 * or other features to interact with the pagination state. The feature
 * automatically handles page bounds validation and recalculation.
 *
 * @public
 */
type PaginationApi = {
    /**
     * Retrieves the current pagination state.
     *
     * @returns The current pagination slice containing page index, page size, total items, and total pages
     */
    getPagination: () => PaginationSlice;
    /**
     * Sets the current page index.
     *
     * @remarks
     * The page index is automatically constrained to valid bounds (0 to totalPages - 1).
     * If the provided value is out of bounds, it will be clamped to the nearest valid value.
     *
     * @param pageIndex - The zero-based page index to navigate to
     */
    setPageIndex: (pageIndex: number) => void;
    /**
     * Sets the number of items per page.
     *
     * @remarks
     * When the page size changes, the page index is automatically reset to 0.
     * The page size is constrained to be at least 1.
     *
     * @param pageSize - The number of items to display per page (minimum 1)
     */
    setPageSize: (pageSize: number) => void;
    /**
     * Resets pagination to its initial state.
     *
     * @remarks
     * This will restore the page index and page size to their initial values
     * specified in the feature options, and reset totalItems and totalPages to 0.
     */
    reset: () => void;
};
/**
 * Configuration options for the pagination feature.
 *
 * @remarks
 * These options define the initial pagination state when the feature is created.
 * Both options are optional and have sensible defaults.
 *
 * @public
 */
type PaginationFeatureOptions = {
    /**
     * The initial zero-based page index to display.
     *
     * @remarks
     * If not provided, defaults to 0 (the first page).
     *
     * @defaultValue 0
     */
    initialPageIndex?: number;
    /**
     * The initial number of items to display per page.
     *
     * @remarks
     * If not provided, defaults to 25 items per page.
     *
     * @defaultValue 25
     */
    initialPageSize?: number;
};
/**
 * Creates a pagination feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds pagination capabilities to a list.
 * It provides an API for managing pagination state and automatically slices the
 * rows during the derive phase to show only the current page. The feature includes
 * UI slots for pagination controls and requires setPageIndex and setPageSize handlers
 * to be implemented.
 *
 * The pagination feature should typically be ordered after filters and sorting
 * to ensure proper calculation of total items and pages based on the filtered
 * and sorted dataset.
 *
 * The feature automatically:
 * - Calculates total pages based on page size and total items
 * - Constrains page index to valid bounds
 * - Resets to first page when page size changes
 * - Updates metadata when the dataset changes
 *
 * @typeParam TRow - The type of row data being paginated
 *
 * @param options - Configuration options for the pagination feature
 *
 * @returns A list feature with UI support that provides pagination capabilities
 *
 * @example
 * ```typescript
 * const pagination = paginationFeature({
 *   initialPageIndex: 0,
 *   initialPageSize: 50
 * });
 * ```
 *
 * @example
 * Using with default options:
 * ```typescript
 * const pagination = paginationFeature();
 * ```
 *
 * @public
 */
declare function paginationFeature<TRow = any>(options?: PaginationFeatureOptions): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, PaginationApi>;

/**
 * Defines the selection mode for a list.
 *
 * @remarks
 * - "none": Selection is disabled, no rows can be selected
 * - "single": Only one row can be selected at a time
 * - "multiple": Multiple rows can be selected simultaneously
 *
 * @public
 */
type SelectionMode = "none" | "single" | "multiple";
/**
 * Internal state slice for the selection feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the selection feature. It is stored in the global list state under the
 * feature's ID.
 *
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
type SelectionSlice<TRowId = any> = {
    /**
     * The current selection mode.
     */
    mode: SelectionMode;
    /**
     * The array of currently selected row IDs.
     */
    selectedIds: ReadonlyArray<TRowId>;
};
/**
 * API interface for managing row selection in a list.
 *
 * @remarks
 * This interface provides methods to query and modify the selection state.
 * It is returned by the selection feature and can be used by UI components
 * or other features to interact with the selection.
 *
 * @typeParam TRow - The type of row data
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
type SelectionApi<TRow = any, TRowId = any> = {
    /**
     * Retrieves the current selection state.
     *
     * @returns The current selection slice containing mode and selected IDs
     */
    getSelection: () => SelectionSlice<TRowId>;
    /**
     * Checks if a specific row is currently selected.
     *
     * @param rowId - The ID of the row to check
     * @returns True if the row is selected, false otherwise
     */
    isSelected: (rowId: TRowId) => boolean;
    /**
     * Adds a row to the selection.
     *
     * @remarks
     * In "single" mode, this replaces the current selection.
     * In "multiple" mode, this adds to the current selection.
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to select
     */
    select: (rowId: TRowId) => void;
    /**
     * Removes a row from the selection.
     *
     * @remarks
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to deselect
     */
    deselect: (rowId: TRowId) => void;
    /**
     * Toggles the selection state of a row.
     *
     * @remarks
     * If the row is currently selected, it will be deselected.
     * If the row is not selected, it will be selected.
     * In "single" mode, selecting a new row replaces the current selection.
     * In "none" mode, this is a no-op.
     *
     * @param rowId - The ID of the row to toggle
     */
    toggle: (rowId: TRowId) => void;
    /**
     * Clears all selected rows.
     *
     * @remarks
     * This sets the selectedIds array to empty.
     */
    clear: () => void;
    /**
     * Replaces the current selection with a new set of row IDs.
     *
     * @remarks
     * In "single" mode, only the first ID is kept.
     * In "multiple" mode, all provided IDs are selected (duplicates are removed).
     * In "none" mode, the selection remains empty.
     *
     * @param ids - The array of row IDs to select
     */
    setSelected: (ids: ReadonlyArray<TRowId>) => void;
    /**
     * Selects all currently visible rows in the list.
     *
     * @remarks
     * This operates on the rows array from ctx.stateRef.current.rows.
     * In "none" mode, this is a no-op.
     * In "single" mode, only the first visible row is selected.
     * In "multiple" mode, all visible rows are selected.
     */
    selectAllVisible: () => void;
};
/**
 * Configuration options for the selection feature.
 *
 * @remarks
 * These options define the selection behavior and initial state.
 *
 * @typeParam TRowId - The type of row identifier
 *
 * @public
 */
type SelectionFeatureOptions<TRowId = any> = {
    /**
     * The selection mode to use.
     *
     * @remarks
     * If not provided, defaults to "none".
     */
    mode?: SelectionMode;
    /**
     * The initial set of selected row IDs.
     *
     * @remarks
     * If not provided, defaults to an empty array.
     * In "single" mode, only the first ID will be used.
     */
    initialSelectedIds?: ReadonlyArray<TRowId>;
};
/**
 * Creates a selection feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds row selection capabilities to a list.
 * It provides an API for managing selection state and supports three modes: none, single,
 * and multiple selection. The feature requires ctx.meta.idKey to be defined, which specifies
 * the property name used to extract row IDs.
 *
 * The selection state is automatically managed and persists across list updates.
 * Duplicate IDs are automatically removed, and in single mode, only one row can be
 * selected at a time.
 *
 * @typeParam TRow - The type of row data
 * @typeParam TRowId - The type of row identifier
 *
 * @param options - Configuration options for the selection feature
 *
 * @returns A list feature with UI support that provides selection capabilities
 *
 * @throws Error if ctx.meta.idKey is not provided during feature creation
 *
 * @example
 * ```typescript
 * const selection = selectionFeature({
 *   mode: 'multiple',
 *   initialSelectedIds: [1, 2, 3]
 * });
 * ```
 *
 * @public
 */
declare function selectionFeature<TRow = any, TRowId = any>(options?: SelectionFeatureOptions<TRowId>): ListFeatureWithUI<TRow, TRowId, CoreListState<TRow>, unknown, SelectionApi<TRow, TRowId>>;

/**
 * Defines the direction of sorting operations.
 *
 * @remarks
 * This type specifies whether sorting should be in ascending or descending order.
 *
 * @public
 */
type SortDirection = "asc" | "desc";
/**
 * Represents the sort descriptor for a list.
 *
 * @remarks
 * This type is intentionally kept simple and serializable to allow maximum flexibility.
 * The fieldId is a generic string to match schema field identifiers. A null value
 * indicates no sorting is applied.
 *
 * @public
 */
type SortValue = {
    /**
     * The identifier of the field to sort by.
     *
     * @remarks
     * This should match the field identifiers in your data schema.
     */
    fieldId: string;
    /**
     * The direction of the sort operation.
     *
     * @remarks
     * If not provided, defaults to "asc" (ascending).
     */
    direction?: SortDirection;
} | null;
/**
 * API interface for managing sorting in a list.
 *
 * @remarks
 * This interface provides methods to get, set, and clear sort values.
 * It is returned by the sorting feature and can be used by UI components
 * or other features to interact with the sorting state.
 *
 * @public
 */
type SortingApi = {
    /**
     * Retrieves the current sort value.
     *
     * @returns The current sort value
     */
    getSort: () => SortValue;
    /**
     * Sets a new sort value.
     *
     * @remarks
     * Can accept either a direct value or a function that receives the previous
     * sort and returns the new sort. This allows for both direct updates
     * and updates based on the current state.
     *
     * @param next - The new sort value or a function to compute it from the previous value
     */
    setSort: (next: SortValue | ((prev: SortValue) => SortValue)) => void;
    /**
     * Resets the sort to its initial value.
     *
     * @remarks
     * This will set the sort back to the value specified in the `initial` option,
     * or to null if no initial value was provided.
     */
    clearSort: () => void;
};
/**
 * Configuration options for the sorting feature.
 *
 * @remarks
 * These options define how the sorting feature behaves. The feature supports two modes:
 * - "apply": Provides full control over the sorting implementation by accepting a function that returns sorted rows
 * - "compare": Uses a comparator function that the library uses with Array.sort()
 *
 * The library remains agnostic to the actual sorting implementation.
 *
 * @typeParam TRow - The type of row data being sorted
 *
 * @public
 */
type SortingFeatureOptions<TRow = any> = {
    /**
     * Specifies that sorting should use the apply strategy.
     */
    mode: "apply";
    /**
     * The sorting strategy function that applies sorting to rows.
     *
     * @remarks
     * This function receives the rows and sort value, and returns the sorted rows.
     * You have full control over the sorting implementation.
     *
     * @param rows - The readonly array of rows to be sorted
     * @param sort - The current sort value to apply
     * @param ctx - The list feature context providing access to state and utilities
     *
     * @returns A readonly array of sorted rows
     */
    apply: (rows: readonly TRow[], sort: SortValue, ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>) => readonly TRow[];
    /**
     * The initial sort value to use when the feature is first created.
     *
     * @remarks
     * If not provided, defaults to null (no sorting).
     */
    initial?: SortValue;
} | {
    /**
     * Specifies that sorting should use the compare strategy.
     */
    mode: "compare";
    /**
     * The comparator function used to compare two rows.
     *
     * @remarks
     * This function follows the standard JavaScript comparator pattern:
     * - Return negative number if a should come before b
     * - Return positive number if a should come after b
     * - Return 0 if they are equal
     *
     * The library handles direction reversal for descending sorts automatically.
     *
     * @param a - The first row to compare
     * @param b - The second row to compare
     * @param sort - The current sort value (guaranteed to be non-null)
     * @param ctx - The list feature context providing access to state and utilities
     *
     * @returns A number indicating the sort order
     */
    compare: (a: TRow, b: TRow, sort: NonNullable<SortValue>, ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>) => number;
    /**
     * The initial sort value to use when the feature is first created.
     *
     * @remarks
     * If not provided, defaults to null (no sorting).
     */
    initial?: SortValue;
};
/**
 * Creates a sorting feature for a list.
 *
 * @remarks
 * This function creates a list feature that adds sorting capabilities to a list.
 * It provides an API for managing sort state and automatically applies sorting
 * during the derive phase. The feature includes UI slots for sort bars and
 * requires setSort handler to be implemented.
 *
 * The sorting logic is completely customizable through either the `apply` or `compare`
 * function, allowing you to implement any sorting strategy that fits your needs.
 *
 * The feature is configured to execute after filtering (if filtering is registered),
 * ensuring the correct order of operations in the data processing pipeline.
 *
 * @typeParam TRow - The type of row data being sorted
 *
 * @param options - Configuration options for the sorting feature
 *
 * @returns A list feature with UI support that provides sorting capabilities
 *
 * @throws Error if neither `apply` nor `compare` function is provided in options
 *
 * @example
 * Using apply mode:
 * ```typescript
 * const sorting = sortingFeature({
 *   mode: "apply",
 *   apply: (rows, sort) => {
 *     if (!sort) return rows;
 *     return [...rows].sort((a, b) => {
 *       const aVal = a[sort.fieldId];
 *       const bVal = b[sort.fieldId];
 *       const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
 *       return sort.direction === "desc" ? -comparison : comparison;
 *     });
 *   },
 *   initial: { fieldId: "name", direction: "asc" }
 * });
 * ```
 *
 * @example
 * Using compare mode:
 * ```typescript
 * const sorting = sortingFeature({
 *   mode: "compare",
 *   compare: (a, b, sort) => {
 *     const aVal = a[sort.fieldId];
 *     const bVal = b[sort.fieldId];
 *     return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
 *   },
 *   initial: { fieldId: "date", direction: "desc" }
 * });
 * ```
 *
 * @public
 */
declare function sortingFeature<TRow = any>(options: SortingFeatureOptions<TRow>): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, SortingApi>;

export { type FilteringApi, type FilteringApplyFn, type FilteringFeatureOptions, type FiltersValue, type GeneralAction, type GeneralActionHandlerContext, type GeneralActionsApi, ListDisplay, type ListDisplayProps, type ModalDescriptor, type ModalRequest, type ModalResult, type ModalScope, type ModalsApi, type ModalsFeatureOptions, type PaginationApi, type PaginationFeatureOptions, type PaginationSlice, type RowAction, type RowActionHandlerContext, type RowActionsApi, type RowActionsFeatureOptions, type SelectionApi, type SelectionFeatureOptions, type SelectionMode, type SelectionSlice, type SortDirection, type SortValue, type SortingApi, type SortingFeatureOptions, filteringFeature, generalActionsFeature, modalsFeature, paginationFeature, rowActionsFeature, selectionFeature, sortingFeature };
