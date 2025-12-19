import {ListFeatureContext} from "../../core/context/listFeatureContext";
import {CoreListState} from "../../core/store/coreState";
import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

/**
 * Represents the filters value that can be of any type.
 *
 * @remarks
 * This type is intentionally kept as unknown to allow maximum flexibility in filter implementations.
 * Consumers should cast this to their specific filter structure.
 *
 * @public
 */
export type FiltersValue = unknown;

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
export type FilteringApplyFn<TRow = any> = (
    rows: readonly TRow[],
    filters: FiltersValue,
    ctx: ListFeatureContext<TRow, any, CoreListState<TRow>, unknown>
) => readonly TRow[];

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
export type FilteringFeatureOptions<TRow = any> = {
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
     * If not provided, defaults to an empty object ({}).
     */
    initial?: FiltersValue;
};

/**
 * Internal state slice for the filtering feature.
 *
 * @remarks
 * This type represents the portion of the feature state that is managed by
 * the filtering feature. It is stored in the global list state under the
 * feature's ID.
 *
 * @internal
 */
type FilteringSlice = {
    /**
     * The current filter values.
     */
    value: FiltersValue;
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
export type FilteringApi = {
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

const FEATURE_ID = "filters";

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
export function filteringFeature<TRow = any>(
    options: FilteringFeatureOptions<TRow>
): ListFeatureWithUI<TRow, any, CoreListState<TRow>, unknown, FilteringApi> {
    if (!options?.apply) {
        throw new Error("filteringFeature requires an 'apply' function.");
    }

    return {
        id: FEATURE_ID,

        ui: {
            slots: ["FiltersPanel"],
            requiredHandlers: ["setFilters"],
        },

        create(ctx) {
            const readSlice = (): FilteringSlice => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<FilteringSlice>(state, FEATURE_ID, () => ({
                    value: options.initial ?? {},
                }));
            };

            const writeSlice = (slice: FilteringSlice) => {
                ctx.setState((prev: CoreListState<TRow>) => setFeatureSlice(prev, FEATURE_ID, slice));
            };

            const api: FilteringApi = {
                getFilters: () => readSlice().value,

                setFilters: (next) => {
                    writeSlice({
                        value:
                            typeof next === "function"
                                ? (next as (p: FiltersValue) => FiltersValue)(readSlice().value)
                                : next,
                    });
                },

                clearFilters: () => {
                    writeSlice({value: options.initial ?? {}});
                },
            };

            return api;
        },

        derive(rows, ctx) {
            const state = ctx.stateRef.current as CoreListState<TRow>;
            const slice = getFeatureSlice<FilteringSlice>(state, FEATURE_ID, () => ({
                value: options.initial ?? {},
            }));

            return options.apply(rows, slice.value, ctx as any);
        },
    };
}
