/**
 * Pagination metadata describing both the current paging parameters and the
 * total counts when known.
 *
 * @public
 */
export interface PaginationState {
    /**
     * Zero-based index of the current page.
     *
     * @remarks
     * The first page is represented by index 0. This value is used to calculate
     * which subset of rows should be displayed when pagination is enabled.
     */
    pageIndex: number;
    /**
     * Number of items requested per page.
     *
     * @remarks
     * Defines how many rows should be displayed on each page. This value is used
     * together with {@link PaginationState.pageIndex} to determine the visible row range.
     */
    pageSize: number;
    /**
     * Optional total number of items available across all pages.
     *
     * @remarks
     * When provided, this value is used to calculate {@link PaginationState.totalPages}
     * and enable UI features like page count display or jump-to-page controls.
     * May be undefined when the total count is not yet known or not applicable.
     */
    totalItems?: number;
    /**
     * Optional total number of pages inferred from {@link PaginationState.totalItems} and {@link PaginationState.pageSize}.
     *
     * @remarks
     * Calculated as `Math.ceil(totalItems / pageSize)` when both values are available.
     * May be undefined when {@link PaginationState.totalItems} is not provided or when
     * the total page count cannot be determined.
     */
    totalPages?: number;
}
//# sourceMappingURL=pagination.d.ts.map