// src/types/sorting.ts

export type SortDirection = "asc" | "desc";

export interface SortDescriptor<TRow = any> {
  field: keyof TRow & string;
  direction: SortDirection;
}
