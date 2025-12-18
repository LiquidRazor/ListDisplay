import type { PaginationState } from "../types";

type AnyRow = any;

/**
 * Recomputes pagination metadata based on the current rows.
 *
 * Ensures that page indices remain valid and recalculates total pages
 * when the row count or page size changes.
 *
 * @param pagination - The current pagination state
 * @param totalItems - The total number of items in the dataset
 * @returns Updated pagination state with corrected indices and metadata
 *
 * @internal
 */
export const updatePaginationMeta = (
  pagination: PaginationState,
  totalItems: number
): PaginationState => {
  const pageSize = pagination.pageSize > 0 ? pagination.pageSize : 10;

  const totalPages =
    totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  let pageIndex = pagination.pageIndex;
  if (pageIndex < 0) pageIndex = 0;
  if (pageIndex >= totalPages) pageIndex = totalPages - 1;

  return {
    ...pagination,
    pageIndex,
    totalItems,
    totalPages,
  };
};

/**
 * Slices the rows according to the pagination state.
 *
 * Extracts the subset of rows that should be displayed on the current page.
 * If pageSize is 0 or negative, returns all rows without pagination.
 *
 * @typeParam TRow - The type of row objects in the array
 * @param rows - The complete array of rows to paginate
 * @param pagination - The pagination state containing page index and size
 * @returns A slice of rows for the current page
 *
 * @internal
 */
export const applyPagination = <TRow = AnyRow>(
  rows: TRow[],
  pagination: PaginationState
): TRow[] => {
  const { pageIndex, pageSize } = pagination;
  if (pageSize <= 0) {
    return rows;
  }

  const start = pageIndex * pageSize;
  const end = start + pageSize;
  return rows.slice(start, end);
};
