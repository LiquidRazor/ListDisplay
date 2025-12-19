import {ListFeatureContext} from "../../core/context/listFeatureContext";
import {CoreListState} from "../../core/store/coreState";
import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

/**
 * Defines the direction of sorting operations.
 *
 * @remarks
 * This type specifies whether sorting should be in ascending or descending order.
 *
 * @public
 */
export type SortDirection = "asc" | "desc";

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
export type SortValue = {
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
 * Internal state slice for the sorting feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the sorting feature. It is stored in the global list state under the
 * feature's ID.
 *
 * @internal
 */
type SortingSlice = {
    /**
     * The current sort value.
     */
    value: SortValue;
};

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
export type SortingApi = {
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
export type SortingFeatureOptions<TRow = any> =
    | {
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
    apply: (
        rows: readonly TRow[],
        sort: SortValue,
        ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>
    ) => readonly TRow[];

    /**
     * The initial sort value to use when the feature is first created.
     *
     * @remarks
     * If not provided, defaults to null (no sorting).
     */
    initial?: SortValue;
}
    | {
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
    compare: (
        a: TRow,
        b: TRow,
        sort: NonNullable<SortValue>,
        ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>
    ) => number;

    /**
     * The initial sort value to use when the feature is first created.
     *
     * @remarks
     * If not provided, defaults to null (no sorting).
     */
    initial?: SortValue;
};


const FEATURE_ID = "sorting";

/**
 * Normalizes a sort value by ensuring it has a direction.
 *
 * @remarks
 * This internal function ensures that all sort values have an explicit direction,
 * defaulting to "asc" if not specified. Null values are preserved.
 *
 * @param value - The sort value to normalize
 *
 * @returns The normalized sort value with explicit direction, or null
 *
 * @internal
 */
function normalizeSort(value: SortValue): SortValue {
    if (!value) return null;
    const direction: SortDirection = value.direction ?? "asc";
    return {fieldId: value.fieldId, direction};
}

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
export function sortingFeature<TRow = any>(
    options: SortingFeatureOptions<TRow>
): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, SortingApi> {
    if (!options) {
        throw new Error("sortingFeature requires options.");
    }
    const hasApply = (options as any).apply != null;
    const hasCompare = (options as any).compare != null;

    if (!hasApply && !hasCompare) {
        throw new Error("sortingFeature requires either an 'apply' or 'compare' function.");
    }

    return {
        id: FEATURE_ID,

        order: {
            after: ["filters"],
        },

        ui: {
            slots: ["SortBar"],
            requiredHandlers: ["setSort"],
        },

        create(ctx) {
            const readSlice = (): SortingSlice => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<SortingSlice>(state, FEATURE_ID, () => ({
                    value: normalizeSort((options as any).initial ?? null),
                }));
            };

            const writeSlice = (slice: SortingSlice) => {
                ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, slice));
            };

            const api: SortingApi = {
                getSort: () => readSlice().value,

                setSort: (next) => {
                    const prevValue = readSlice().value;
                    const resolved = typeof next === "function"
                        ? (next as (p: SortValue) => SortValue)(prevValue)
                        : next;

                    writeSlice({value: normalizeSort(resolved)});
                },

                clearSort: () => {
                    writeSlice({value: normalizeSort((options as any).initial ?? null)});
                },
            };

            return api;
        },

        derive(rows, ctx) {
            const state = ctx.stateRef.current as CoreListState<TRow>;
            const slice = getFeatureSlice<SortingSlice>(state, FEATURE_ID, () => ({
                value: normalizeSort((options as any).initial ?? null),
            }));

            const sort = slice.value;
            if (!sort) return rows;

            if (!sort) return rows;

            if (options.mode === "apply") {
                return options.apply(rows, sort, ctx);
            }

            const out = [...rows];
            out.sort((a, b) => {
                const base = options.compare(a, b, sort, ctx);
                return sort.direction === "desc" ? -base : base;
            });
            return out;
        },
    };
}
