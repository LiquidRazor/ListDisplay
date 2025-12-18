import React from "react";
import type { PaginationProps } from "../../types";

/**
 * Basic pagination controls.
 */
export const ListPagination: React.FC<PaginationProps> = ({
                                                            state,
                                                            onChangePage,
                                                            onChangePageSize,
                                                          }) => {
  const { pagination } = state;
  const {
    pageIndex,
    pageSize,
    totalItems = 0,
    totalPages = 1,
  } = pagination;

  const canPrev = pageIndex > 0;
  const canNext = pageIndex < totalPages - 1;

  const handlePrev = () => {
    if (!canPrev || !onChangePage) return;
    onChangePage(pageIndex - 1);
  };

  const handleNext = () => {
    if (!canNext || !onChangePage) return;
    onChangePage(pageIndex + 1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Number(event.target.value);
    if (!Number.isFinite(value) || value <= 0) return;
    onChangePageSize?.(value);
  };

  return (
      <div className="ld-list__pagination">
        <div className="ld-list__pagination-info">
        <span>
          Page {pageIndex + 1} of {totalPages}
        </span>
          <span className="ld-list__pagination-total">
          {totalItems} items
        </span>
        </div>

        <div className="ld-list__pagination-controls">
          <button
              type="button"
              className="ld-list__pagination-button"
              onClick={handlePrev}
              disabled={!canPrev}
          >
            Prev
          </button>
          <button
              type="button"
              className="ld-list__pagination-button"
              onClick={handleNext}
              disabled={!canNext}
          >
            Next
          </button>

          <label className="ld-list__pagination-pagesize">
            <span>Rows per page</span>
            <select
                className="ld-list__pagination-pagesize-select"
                value={pageSize}
                onChange={handlePageSizeChange}
            >
              {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
              ))}
            </select>
          </label>
        </div>
      </div>
  );
};

export default ListPagination;
