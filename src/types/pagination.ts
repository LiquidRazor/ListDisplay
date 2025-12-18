/**
 * Pagination metadata describing both the current paging parameters and the
 * total counts when known.
 */
export interface PaginationState {
  /** Zero-based index of the current page. */
  pageIndex: number;

  /** Number of items requested per page. */
  pageSize: number;

  /** Optional total number of items available. */
  totalItems?: number;

  /** Optional total number of pages inferred from {@link totalItems}. */
  totalPages?: number;
}
