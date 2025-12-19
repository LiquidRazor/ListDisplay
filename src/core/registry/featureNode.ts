import {ListFeatureWithUI} from "../contracts/listFeatureWithUI";

/**
 * Represents a node in the feature dependency graph used for topological resolution and initialization ordering.
 *
 * @remarks
 * This type serves as a vertex in the directed acyclic graph (DAG) that models feature dependencies
 * within the list feature registry system. Each node encapsulates a complete feature definition along
 * with its dependency metadata, enabling efficient dependency resolution through Kahn's algorithm for
 * topological sorting.
 *
 * The dependency graph construction process involves:
 * - Extracting explicit dependencies from the feature's `dependsOn` array
 * - Processing ordering constraints from `order.before` and `order.after` properties
 * - Building bidirectional edges for relative ordering constraints
 * - Validating the graph for circular dependencies before initialization
 *
 * During topological sorting, nodes are processed in dependency order: nodes with zero incoming edges
 * (satisfied dependencies) are processed first, and as each node is processed, it is removed from the
 * dependency sets of downstream nodes. This continues until all nodes are processed or a cycle is detected.
 *
 * The resulting order guarantees that:
 * - Features are initialized after all their explicit dependencies
 * - Features respect all `order.before` and `order.after` constraints
 * - The initialization sequence is deterministic and repeatable
 * - No feature accesses uninitialized dependencies during its lifecycle
 *
 * @public
 *
 * @see {@link resolveFeatureOrder} for the topological sort implementation using these nodes
 * @see {@link ListFeatureWithUI} for the complete feature interface definition
 * @see {@link FeatureStage} for the execution stages where features are ordered
 *
 * @example
 * ```typescript
 * const node: FeatureNode = {
 *   id: 'filtering',
 *   feature: filteringFeature,
 *   deps: new Set(['sorting', 'search'])
 * };
 * ```
 */
export type FeatureNode = {
  /**
   * The unique string identifier for the feature within the registry.
   *
   * @remarks
   * This identifier serves as the primary key for feature resolution and must be unique across
   * all registered features in the system. It must exactly match the `id` property of the
   * associated {@link feature} object to maintain referential integrity.
   *
   * The identifier is used throughout the dependency resolution process for:
   * - Building edges in the dependency graph by matching against `dependsOn` arrays
   * - Resolving relative ordering constraints from `order.before` and `order.after`
   * - Detecting circular dependencies during graph validation
   * - Generating descriptive error messages with feature names
   * - Indexing features in the compiled feature registry
   *
   * Convention: Feature IDs should use lowercase kebab-case naming (e.g., 'row-selection',
   * 'column-sorting') to maintain consistency across the codebase.
   */
  id: string;

  /**
   * The complete feature instance containing all definitions, hooks, and configuration.
   *
   * @remarks
   * This property holds the actual feature object that will be compiled and executed during
   * the list lifecycle. The feature instance contains all the information necessary for
   * the feature to function, including:
   *
   * - **Lifecycle hooks**: `onInit`, `onDestroy`, and `onRefresh` callbacks for managing
   *   feature state throughout the component lifetime
   * - **Derive functions**: Pure functions that transform or enrich row data during the
   *   derive stage of the feature pipeline
   * - **Event handlers**: Callback registrations for user interactions and system events
   * - **UI components**: Rendering functions and React elements for visual representation
   * - **Ordering constraints**: `order.before` and `order.after` arrays defining relative
   *   positioning requirements
   * - **Explicit dependencies**: `dependsOn` array listing features that must be initialized
   *   before this feature
   *
   * The feature object is type-parameterized with row type and row ID type, allowing
   * type-safe access to list data throughout the feature implementation. After dependency
   * resolution, features are compiled into an optimized execution plan that invokes their
   * hooks and functions in the correct order across all pipeline stages.
   *
   * @see {@link ListFeatureWithUI} for the complete feature interface specification
   */
  feature: ListFeatureWithUI<any, any>;

  /**
   * Mutable set of feature IDs representing unresolved dependencies for this node.
   *
   * @remarks
   * This set tracks the dependencies that must be satisfied before this feature can be
   * initialized and added to the resolved execution order. The set is dynamically constructed
   * during the dependency graph building phase and mutated during topological sorting.
   *
   * **Construction phase**: The set is populated by combining multiple dependency sources:
   * - Explicit dependencies from the feature's `dependsOn` array
   * - Implicit dependencies from the feature's `order.after` array (features that must
   *   execute before this one)
   * - Reverse dependencies added when other features specify this feature in their
   *   `order.before` array
   *
   * **Resolution phase**: During topological sorting via Kahn's algorithm, the set is
   * progressively reduced as dependencies are satisfied:
   * 1. Features with empty dependency sets are identified as ready for initialization
   * 2. Ready features are added to the resolved order and removed from the graph
   * 3. The removed feature's ID is deleted from the `deps` sets of all downstream features
   * 4. Steps 1-3 repeat until all features are resolved or a cycle is detected
   *
   * When this set becomes empty, it indicates that all of the feature's dependencies have
   * been processed and the feature is ready to be added to the final initialization order.
   * If the algorithm completes with non-empty dependency sets remaining, it indicates a
   * circular dependency that must be reported as an error.
   *
   * The set uses string feature IDs rather than node references to simplify comparison
   * operations and maintain a clear separation between graph structure and node data.
   */
  deps: Set<string>;
};
