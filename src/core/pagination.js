/**
 * Recomputes pagination metadata based on the current rows.
 */
export const updatePaginationMeta = (pagination, totalItems) => {
    const pageSize = pagination.pageSize > 0 ? pagination.pageSize : 10;
    const totalPages = totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    let pageIndex = pagination.pageIndex;
    if (pageIndex < 0)
        pageIndex = 0;
    if (pageIndex >= totalPages)
        pageIndex = totalPages - 1;
    return {
        ...pagination,
        pageIndex,
        totalItems,
        totalPages,
    };
};
/**
 * Slices the rows according to the pagination state.
 */
export const applyPagination = (rows, pagination) => {
    const { pageIndex, pageSize } = pagination;
    if (pageSize <= 0) {
        return rows;
    }
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    return rows.slice(start, end);
};
