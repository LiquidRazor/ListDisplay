/**
 * Feature registry module providing factory functions for creating and managing list feature registries.
 *
 * @remarks
 * This module exports the core feature registry factory function that enables centralized registration,
 * validation, and compilation of list features. The registry pattern ensures proper feature ordering
 * through dependency resolution and prevents runtime errors from duplicate registrations or post-compilation
 * modifications.
 *
 * The compiled registry produces an optimized execution plan that coordinates feature execution across
 * all pipeline stages (derive, handlers, lifecycle, ui) and maintains feature APIs for cross-feature
 * communication.
 *
 * @packageDocumentation
 * @public
 */

import {FeatureRegistry} from "./featureRegistryType";
import {ListFeatureWithUI} from "../contracts/listFeatureWithUI";
import {CompiledFeaturePlan} from "./compiledFeaturePlan";
import {resolveFeatureOrder} from "./featureResolver";

/**
 * Creates a new feature registry instance for managing list features with type-safe APIs.
 *
 * @remarks
 * This factory function creates a registry object that provides two primary operations:
 *
 * 1. **register** - Adds features to the registry before compilation. Features must have unique
 *    identifiers and can only be registered before the compile method is called. Registration
 *    enforces uniqueness constraints and validates feature structure.
 *
 * 2. **compile** - Finalizes the registry and produces an optimized execution plan. This method:
 *    - Resolves feature dependencies using topological sorting
 *    - Validates all registered features
 *    - Creates feature API instances
 *    - Organizes features into execution pipelines (derive, onInit, onDestroy, onRefresh)
 *    - Collects UI contracts for rendering integration
 *    - Marks the registry as immutable to prevent further modifications
 *
 * The registry maintains internal state to prevent duplicate registrations and multiple compilations,
 * ensuring predictable feature initialization and execution order. Once compiled, the registry cannot
 * accept new feature registrations, guaranteeing consistency across the feature lifecycle.
 *
 * @typeParam TRow - The type of individual row data objects in the list
 * @typeParam TRowId - The type used for unique row identifiers (typically string or number)
 * @typeParam TState - The shape of the internal list state object
 * @typeParam TSnapshot - The type of the exported/serialized state snapshot
 *
 * @returns A feature registry object with register and compile methods for managing features
 *
 * @example
 * ```typescript
 * const registry = createFeatureRegistry<MyRow, string, MyState, MySnapshot>();
 * registry
 *   .register(sortingFeature)
 *   .register(filteringFeature);
 * const plan = registry.compile(context);
 * ```
 *
 * @see {@link FeatureRegistry} for the registry interface definition
 * @see {@link CompiledFeaturePlan} for the compilation output structure
 * @see {@link resolveFeatureOrder} for dependency resolution algorithm
 *
 * @public
 */
export function createFeatureRegistry<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown
>(): FeatureRegistry<TRow, TRowId, TState, TSnapshot> {
    const features = new Map<string, ListFeatureWithUI<TRow, TRowId, TState, TSnapshot, any>>();
    let compiled = false;

    return {
        /**
         * Registers a new feature in the registry before compilation.
         *
         * @remarks
         * This method adds a feature to the internal registry map for later compilation. Registration
         * performs validation to ensure:
         * - The registry has not yet been compiled (features cannot be added after compilation)
         * - The feature identifier is unique within the registry (no duplicate IDs allowed)
         *
         * Features are stored in a Map data structure keyed by their unique identifier, enabling
         * efficient lookups during compilation and preventing accidental overwrites. The method
         * returns the registry instance to support fluent chaining syntax for registering multiple
         * features in sequence.
         *
         * Registration order does not affect execution order, as features are reordered during
         * compilation based on dependency resolution to ensure proper initialization sequence.
         *
         * @param feature - The feature object to register, which must include a unique id property
         *                  and conform to the ListFeatureWithUI interface
         *
         * @returns The registry instance for method chaining
         *
         * @throws Error if the registry has already been compiled
         * @throws Error if a feature with the same id is already registered
         *
         * @example
         * ```typescript
         * registry
         *   .register(featureA)
         *   .register(featureB)
         *   .register(featureC);
         * ```
         *
         * @public
         */
        register(feature) {
            if (compiled) {
                throw new Error(`Cannot register feature '${feature.id}' after registry compilation`);
            }
            if (features.has(feature.id)) {
                throw new Error(`Duplicate feature id '${feature.id}'`);
            }
            features.set(feature.id, feature);
            return this;
        },

        /**
         * Compiles all registered features into an optimized execution plan.
         *
         * @remarks
         * This method performs the final compilation step that transforms the collection of registered
         * features into a structured execution plan. The compilation process consists of several phases:
         *
         * 1. **Validation** - Ensures the compile method is only called once to maintain consistency
         * 2. **Dependency Resolution** - Orders features using topological sorting based on their
         *    declared dependencies, ensuring features are initialized in the correct sequence
         * 3. **Feature Validation** - Invokes optional validate hooks on each feature with configuration
         *    context to verify feature integrity
         * 4. **API Creation** - Calls create methods on features to instantiate feature-specific APIs
         *    that will be stored in the context's features registry
         * 5. **Pipeline Assembly** - Collects lifecycle hooks (derive, onInit, onDestroy, onRefresh)
         *    into ordered arrays for efficient sequential execution
         * 6. **UI Contract Collection** - Gathers UI contracts from all features for rendering integration
         *
         * After compilation completes, the registry is marked as immutable and no additional features
         * can be registered. The resulting CompiledFeaturePlan object contains all necessary data
         * structures for executing features throughout the list lifecycle.
         *
         * The compilation process uses null-prototype objects for featureApis and uiContracts to
         * prevent prototype chain pollution and ensure predictable property access.
         *
         * @param ctx - The list feature context object providing state management, refresh capabilities,
         *              and metadata access to features during API creation
         *
         * @returns A compiled feature plan containing organized pipelines, lifecycle hooks, feature APIs,
         *          and UI contracts ready for execution
         *
         * @throws Error if compile is called more than once on the same registry instance
         *
         * @see {@link CompiledFeaturePlan} for the structure of the returned compilation result
         * @see {@link resolveFeatureOrder} for the dependency resolution algorithm
         * @see {@link ListFeatureContext} for the context object interface
         *
         * @public
         */
        compile(ctx) {
            if (compiled) {
                throw new Error("FeatureRegistry.compile() called twice");
            }
            compiled = true;

            const ordered = resolveFeatureOrder([...features.values()]);

            const derivePipeline: CompiledFeaturePlan<TRow>["derivePipeline"] = [];
            const onInit: CompiledFeaturePlan<TRow>["onInit"] = [];
            const onDestroy: CompiledFeaturePlan<TRow>["onDestroy"] = [];
            const onRefresh: CompiledFeaturePlan<TRow>["onRefresh"] = [];

            const featureApis: Record<string, unknown> = Object.create(null);
            const uiContracts: CompiledFeaturePlan<TRow>["uiContracts"] = Object.create(null);

            for (const feature of ordered) {
                uiContracts[feature.id] = feature.ui;

                feature.validate?.({config: null, hasUI: false});

                if (feature.create) {
                    featureApis[feature.id] = feature.create(ctx);
                }
                if (feature.derive) derivePipeline.push(feature.derive);
                if (feature.onInit) onInit.push(feature.onInit);
                if (feature.onDestroy) onDestroy.push(feature.onDestroy);
                if (feature.onRefresh) onRefresh.push(feature.onRefresh);
            }

            return {
                derivePipeline,
                onInit,
                onDestroy,
                onRefresh,
                featureApis,
                uiContracts,
            };
        },
    };
}

