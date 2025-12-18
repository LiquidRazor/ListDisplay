export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "between";

export type FilterType =
  | "text"
  | "select"
  | "multiSelect"
  | "number"
  | "date"
  | "boolean"
  | "custom";

export interface FilterOption {
  value: string | number | boolean;
  label: string;
}

/**
 * Per-field filter configuration.
 */
export interface FieldFilterConfig<TRow = any, TValue = any> {
  type: FilterType;
  operators?: FilterOperator[];
  /**
   * Normalizes a raw value from the row into something that can be used
   * for generic filtering / searching.
   */
  normalize?: (value: TValue, row: TRow) => string | number | boolean | null;
  /**
   * Optional list of static options (for select / multiSelect).
   */
  options?: FilterOption[];
}

/**
 * Active filters at list level.
 * Keyed by field id (or custom logical id).
 */
export type ActiveFilterState = Record<string, unknown>;
