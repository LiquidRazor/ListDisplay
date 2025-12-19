import type { ListSlots } from "./listSlots";
import {ListRuntimePlan} from "../registry/compiledFeaturePlan";

/**
 * Configuration options for UI wiring validation behavior.
 *
 * @remarks
 * This type defines the configuration options that control how the UI wiring validation
 * process behaves when validating the connection between UI components and their required
 * feature handler implementations. It provides flexibility in handling validation failures
 * and allows conditional disabling of validation in specific environments.
 *
 * The validation system ensures that when UI components are rendered in specific slots,
 * all required handler methods are properly implemented in the feature API. This prevents
 * runtime errors caused by missing handler implementations.
 *
 * @internal
 */
export type UiWiringValidationOptions = {
    /**
     * Determines the validation failure behavior mode.
     *
     * @remarks
     * Controls how the validation system responds when it detects invalid UI wiring:
     * - `"throw"` (default): Throws an error immediately, preventing execution
     * - `"warn"`: Logs a warning to console but allows execution to continue
     *
     * Use `"throw"` mode in development to catch wiring errors early. Use `"warn"` mode
     * in scenarios where you want to log issues without blocking execution, though this
     * is generally not recommended as it may lead to runtime errors when handlers are invoked.
     *
     * @defaultValue `"throw"`
     */
    mode?: "throw" | "warn";

    /**
     * Controls whether validation is performed at all.
     *
     * @remarks
     * When set to `false`, the validation process is completely skipped. This can be useful
     * in production environments where validation overhead is undesirable and you have high
     * confidence in the correctness of your UI wiring through comprehensive testing.
     *
     * **Warning**: Disabling validation in production removes an important safety check.
     * Only disable validation if you have thorough automated tests covering all UI wiring
     * scenarios and accept the risk of potential runtime errors from missing handlers.
     *
     * @defaultValue `true`
     */
    enabled?: boolean;
};

/**
 * Checks whether any of the specified slot names have corresponding components defined.
 *
 * @remarks
 * This utility function determines if at least one slot from a provided list of slot names
 * has an associated component in the components registry. It performs a shallow existence
 * check and returns `true` as soon as the first matching slot is found, optimizing for
 * early termination.
 *
 * The function is used during validation to determine whether a feature's UI is "active"
 * (i.e., whether any of its declared slots have been populated with actual components).
 * If no slots are active, validation of handler requirements is skipped for that feature.
 *
 * @param components - The components registry mapping slot names to component implementations
 * @param slots - Optional array of slot names to check for existence in the components registry
 *
 * @returns `true` if at least one slot from the provided array exists in the components registry,
 *          `false` if the slots array is undefined, empty, or none of the slots exist
 *
 * @internal
 */
function hasAnySlot(components: ListSlots, slots?: string[]): boolean {
    if (!slots || slots.length === 0) return false;
    for (const s of slots) {
        if (components[s]) return true;
    }
    return false;
}

/**
 * Type guard function that checks whether a value is a function.
 *
 * @remarks
 * This utility function performs a runtime type check to determine if the provided value
 * is a function type. It uses TypeScript's type predicate feature to narrow the type of
 * the value in subsequent code when the check returns `true`.
 *
 * The function is used during validation to verify that required handler methods are
 * actually functions rather than other types of values (undefined, null, objects, etc.).
 * This ensures that handlers can be safely invoked by UI components.
 *
 * @param value - The value to check for function type
 *
 * @returns `true` if the value is a function, `false` otherwise. When `true`, TypeScript
 *          narrows the type to `(...args: any[]) => any`
 *
 * @internal
 */
function isFunction(value: unknown): value is (...args: any[]) => any {
    return typeof value === "function";
}

/**
 * Validates that all UI components have their required feature handler implementations available.
 *
 * @remarks
 * This function performs comprehensive validation of the UI wiring contract, ensuring that when
 * UI components are rendered in specific slots, all handler methods required by those components
 * are properly implemented in the corresponding feature APIs. This validation prevents runtime
 * errors that would occur if UI components attempted to invoke missing or incorrectly typed handlers.
 *
 * The validation process works as follows:
 *
 * 1. **Contract Discovery**: Examines the `uiContracts` metadata in the runtime plan, which maps
 *    feature IDs to their UI contract specifications (declared slots and required handlers)
 *
 * 2. **Active UI Detection**: For each feature contract, checks if any of the feature's declared
 *    slots have actual components rendered using {@link hasAnySlot}. If no slots are active,
 *    validation is skipped for that feature (no UI = no handler requirements)
 *
 * 3. **Feature API Verification**: Confirms that the feature API exists in the runtime's feature
 *    registry (`runtime.features[featureId]`). Reports an error if UI slots are active but the
 *    API is missing
 *
 * 4. **Handler Implementation Check**: For each required handler specified in the contract,
 *    verifies that the handler exists on the feature API and is a function using {@link isFunction}.
 *    Reports an error for any missing or non-function handlers
 *
 * 5. **Error Reporting**: Collects all validation errors and either throws an error or logs a
 *    warning based on the configured mode
 *
 * **Usage Pattern:**
 *
 * This function should be called **exactly once** during the initialization phase when assembling
 * the list display, typically inside the `ListDisplay` component after the runtime plan and slot
 * components have been prepared but before rendering begins. Calling it multiple times is
 * unnecessary and adds validation overhead.
 *
 * ```typescript
 * function ListDisplay() {
 *   const runtime = useListRuntime();
 *   const components = useListSlots();
 *
 *   validateUiWiring(runtime, components, {
 *     mode: "throw",
 *     enabled: process.env.NODE_ENV !== "production"
 *   });
 *
 *   return <List runtime={runtime} slots={components} />;
 * }
 * ```
 *
 * **Error Messages:**
 *
 * When validation fails, error messages clearly identify:
 * - The feature ID with invalid wiring
 * - The specific slots that are active
 * - Missing feature APIs or handler implementations
 * - The exact handler names that are missing or incorrectly typed
 *
 * @param runtime - The compiled runtime plan containing feature APIs and UI contracts metadata
 * @param components - The registry of UI components mapped to their slot names
 * @param options - Optional configuration controlling validation behavior (mode and enabled flag)
 *
 * @throws {Error} When validation fails and `options.mode` is `"throw"` (default), throws an
 *                 error with a detailed message listing all validation failures
 *
 * @see {@link UiWiringValidationOptions} for configuration options
 * @see {@link ListRuntimePlan} for the runtime plan structure
 * @see {@link ListSlots} for the slot component registry structure
 *
 * @internal
 */
export function validateUiWiring(
    runtime: ListRuntimePlan<any>,
    components: ListSlots,
    options: UiWiringValidationOptions = {}
): void {
    const { mode = "throw", enabled = true } = options;
    if (!enabled) return;

    const uiContracts = (runtime as any).uiContracts as Record<
        string,
        { slots?: string[]; requiredHandlers?: string[] } | undefined
    >;

    if (!uiContracts) return;

    const errors: string[] = [];

    for (const [featureId, contract] of Object.entries(uiContracts)) {
        if (!contract) continue;

        const uiActive = hasAnySlot(components, contract.slots);
        if (!uiActive) continue;

        const api = runtime.features?.[featureId];
        if (!api) {
            errors.push(
                `Feature '${featureId}' declares UI slots [${(contract.slots ?? []).join(", ")}] ` +
                `but no API was created (ctx.features['${featureId}'] is missing).`
            );
            continue;
        }

        for (const handlerName of contract.requiredHandlers ?? []) {
            const candidate = (api as any)[handlerName];
            if (!isFunction(candidate)) {
                errors.push(
                    `Feature '${featureId}' UI requires handler '${handlerName}', ` +
                    `but ctx.features['${featureId}'].${handlerName} is missing or not a function.`
                );
            }
        }
    }

    if (errors.length === 0) return;

    const message =
        `ListDisplay UI wiring is invalid:\n` +
        errors.map((e) => `- ${e}`).join("\n");

    if (mode === "warn") {
        console.warn(message);
        return;
    }

    throw new Error(message);
}
