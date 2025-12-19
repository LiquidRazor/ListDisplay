import {ListFeatureWithUI} from "../contracts/listFeatureWithUI";
import {ListFeatureContext} from "../context/listFeatureContext";
import {CompiledFeaturePlan} from "./compiledFeaturePlan";

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
 * @internal
 */
export interface FeatureRegistry<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown
> {
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
