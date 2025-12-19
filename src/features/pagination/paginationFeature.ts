import {ListFeatureWithUI} from "../../core/contracts/listFeatureWithUI";
import {CoreListState} from "../../core/store/coreState";
import {getFeatureSlice, setFeatureSlice} from "../../core/store/featureState";

const FEATURE_ID = "pagination";

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
export type PaginationSlice = {
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
export type PaginationApi = {
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
export type PaginationFeatureOptions = {
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

const DEFAULT_PAGE_SIZE = 25;

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
export function paginationFeature<TRow = any>(
    options: PaginationFeatureOptions = {}
): ListFeatureWithUI<
    TRow,
    any,
    CoreListState<TRow>,
    unknown,
    PaginationApi
> {
    const initialPageIndex = options.initialPageIndex ?? 0;
    const initialPageSize = options.initialPageSize ?? DEFAULT_PAGE_SIZE;

    return {
        id: FEATURE_ID,

        order: {
            after: ["filters", "sorting"],
        },

        ui: {
            slots: ["Pagination"],
            requiredHandlers: ["setPageIndex", "setPageSize"],
        },

        create(ctx) {
            const readSlice = (): PaginationSlice => {
                const state = ctx.stateRef.current as CoreListState<TRow>;
                return getFeatureSlice<PaginationSlice>(state, FEATURE_ID, () => ({
                    pageIndex: initialPageIndex,
                    pageSize: initialPageSize,
                    totalItems: 0,
                    totalPages: 0,
                }));
            };

            const writeSlice = (slice: PaginationSlice) => {
                ctx.setState((prev: CoreListState<TRow>) =>
                    setFeatureSlice(prev, FEATURE_ID, slice)
                );
            };

            const api: PaginationApi = {
                getPagination: () => readSlice(),

                setPageIndex: (pageIndex) => {
                    const s = readSlice();
                    writeSlice({
                        ...s,
                        pageIndex: Math.max(0, Math.min(pageIndex, s.totalPages - 1)),
                    });
                },

                setPageSize: (pageSize) => {
                    const s = readSlice();
                    writeSlice({
                        ...s,
                        pageSize: Math.max(1, pageSize),
                        pageIndex: 0, // reset page on size change
                    });
                },

                reset: () => {
                    writeSlice({
                        pageIndex: initialPageIndex,
                        pageSize: initialPageSize,
                        totalItems: 0,
                        totalPages: 0,
                    });
                },
            };

            return api;
        },

        derive(rows, ctx) {
            const state = ctx.stateRef.current as CoreListState<TRow>;
            const slice = getFeatureSlice<PaginationSlice>(state, FEATURE_ID, () => ({
                pageIndex: initialPageIndex,
                pageSize: initialPageSize,
                totalItems: 0,
                totalPages: 0,
            }));

            const totalItems = rows.length;
            const totalPages = Math.max(1, Math.ceil(totalItems / slice.pageSize));

            const safePageIndex = Math.min(slice.pageIndex, totalPages - 1);
            const start = safePageIndex * slice.pageSize;
            const end = start + slice.pageSize;

            // update meta if needed
            if (
                slice.totalItems !== totalItems ||
                slice.totalPages !== totalPages ||
                slice.pageIndex !== safePageIndex
            ) {
                ctx.setState((prev: CoreListState<TRow>) =>
                    setFeatureSlice(prev, FEATURE_ID, {
                        ...slice,
                        pageIndex: safePageIndex,
                        totalItems,
                        totalPages,
                    })
                );
            }

            return rows.slice(start, end);
        },
    };
}
