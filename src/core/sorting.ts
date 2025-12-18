import type {SortDescriptor, FieldSchema} from "../types";

type AnyRow = any;

/**
 * Context object containing sorting configuration and field metadata for list operations.
 *
 * @internal
 */
export interface SortingContext<TRow = AnyRow> {
  /**
   * Optional sort descriptor specifying the field and direction to sort by.
   */
  sort?: SortDescriptor<TRow>;
  /**
   * Array of field schemas defining the structure of rows in the list.
   */
  fields: Array<FieldSchema<TRow>>;
}

/**
 * Compares two values for sorting purposes with null-safe handling.
 * Supports numbers, dates, and falls back to case-insensitive string comparison.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns Negative if a < b, positive if a > b, zero if equal
 *
 * @internal
 */
const compareValues = (a: unknown, b: unknown): number => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  if (a instanceof Date && b instanceof Date) {
    return a.getTime() - b.getTime();
  }

  const sa = String(a).toLowerCase();
  const sb = String(b).toLowerCase();
  if (sa < sb) return -1;
  if (sa > sb) return 1;
  return 0;
};

/**
 * Applies sorting to a list of rows based on the provided sorting context.
 * Returns a new sorted array without mutating the original.
 *
 * @param rows - Array of rows to sort
 * @param ctx - Sorting context containing sort descriptor and field schemas
 * @returns New array with rows sorted according to the sort descriptor, or original array if no sort is specified
 *
 * @internal
 */
export const applySorting = <TRow = AnyRow>(
  rows: TRow[],
  ctx: SortingContext<TRow>
): TRow[] => {
  const { sort } = ctx;
  if (!sort) {
    return rows;
  }

  const { field, direction } = sort;

  return [...rows].sort((a, b) => {
    const va = (a as any)[field];
    const vb = (b as any)[field];
    const cmp = compareValues(va, vb);
    return direction === "asc" ? cmp : -cmp;
  });
};
