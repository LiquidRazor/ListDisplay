// src/types/pagination.ts

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
  totalItems?: number;
  totalPages?: number;
}
