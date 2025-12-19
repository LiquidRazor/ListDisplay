import {FeatureRegistry} from "../registry/featureRegistryType";
import {CompiledFeaturePlan, createRuntimePlan, ListRuntimePlan} from "../registry/compiledFeaturePlan";
import {ListFeatureContext, SetStateFn} from "./listFeatureContext";

/**
 * Configuration arguments for creating a list runtime instance.
 *
 * @remarks
 * This type defines all required dependencies and callbacks needed to initialize
 * a list runtime environment that manages feature execution and state coordination.
 *
 * @typeParam TRow - The type of individual row data items in the list
 * @typeParam TRowId - The type used to uniquely identify rows
 * @typeParam TState - The type of the internal state object managed by the runtime
 * @typeParam TSnapshot - The type of the exported state snapshot representation
 *
 * @internal
 */
export type CreateListRuntimeArgs<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown
> = {
    /**
     * The feature registry containing all registered features to be compiled and executed.
     */
    registry: FeatureRegistry<TRow, TRowId>;

    /**
     * A mutable reference object holding the current state, enabling external state tracking.
     */
    stateRef: { current: TState };

    /**
     * Callback function to update the state, typically used to trigger re-renders in UI frameworks.
     */
    setState: SetStateFn<TState>;

    /**
     * Implementation function that performs a refresh operation, typically refetching or recalculating data.
     */
    refreshImpl: () => Promise<void>;

    /**
     * Implementation function that exports the current state as a snapshot for serialization or persistence.
     */
    exportStateImpl: () => TSnapshot;

    /**
     * Optional metadata object containing additional context information such as field definitions and ID key mappings.
     */
    meta?: ListFeatureContext<TRow, TRowId, TState, TSnapshot>["meta"];
};

/**
 * Creates a list runtime execution plan by compiling registered features and establishing the execution context.
 *
 * @remarks
 * This function serves as the primary factory for instantiating list runtime environments. It constructs
 * a feature context from the provided dependencies, compiles all registered features through the registry,
 * and produces a runtime plan that coordinates feature execution and state management throughout the
 * list's lifecycle.
 *
 * The function performs the following operations:
 * 1. Constructs a ListFeatureContext with all necessary state management callbacks
 * 2. Compiles the feature registry to produce a CompiledFeaturePlan
 * 3. Creates and returns a ListRuntimePlan that orchestrates feature execution
 *
 * @typeParam TRow - The type of individual row data items in the list
 * @typeParam TRowId - The type used to uniquely identify rows
 * @typeParam TState - The type of the internal state object managed by the runtime
 * @typeParam TSnapshot - The type of the exported state snapshot representation
 *
 * @param args - Configuration object containing all required dependencies and callbacks
 * @returns A ListRuntimePlan instance that manages feature execution and provides access to compiled feature APIs
 *
 * @internal
 */
export function createListRuntime<
    TRow = any,
    TRowId = any,
    TState = unknown,
    TSnapshot = unknown
>(args: CreateListRuntimeArgs<TRow, TRowId, TState, TSnapshot>): ListRuntimePlan<TRow> {

    const {registry, stateRef, setState, refreshImpl, exportStateImpl, meta} = args;
    const ctx: ListFeatureContext<TRow, TRowId, TState, TSnapshot> = {
        state: stateRef.current,
        stateRef,
        setState,
        refresh: refreshImpl,
        exportState: exportStateImpl,
        features: Object.create(null),
        meta,
    };
    const compiled: CompiledFeaturePlan<TRow> = registry.compile(ctx as any);
    return createRuntimePlan<TRow>(ctx as any, compiled);
}
