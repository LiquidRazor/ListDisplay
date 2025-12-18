/**
 * Operators supported by the filtering engine.
 *
 * @remarks
 * Includes comparison operators (equals, notEquals, gt, gte, lt, lte, between),
 * text operators (contains, startsWith, endsWith), and set operators (in).
 *
 * @public
 */
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

/**
 * Logical filter types used to match operators and value shapes.
 *
 * @remarks
 * Determines which operators are available and how filter values are interpreted.
 * Custom types allow for specialized filtering logic.
 *
 * @public
 */
export type FilterType =
  | "text"
  | "select"
  | "multiSelect"
  | "number"
  | "date"
  | "boolean"
  | "custom";

/**
 * Option used by select-based filters.
 *
 * @remarks
 * Used by select and multiSelect filter types to provide predefined choices.
 *
 * @public
 */
export interface FilterOption {
  /** Option value stored in the filter state. */
  value: string | number | boolean;

  /** Human-readable label presented to the user. */
  label: string;
}

/**
 * Per-field filter configuration.
 *
 * @remarks
 * Defines how a specific field should be filtered, including the filter type,
 * available operators, normalization logic, and predefined options.
 *
 * @public
 */
export interface FieldFilterConfig<TRow = any, TValue = any> {
  /** The type of filter to use for this field. */
  type: FilterType;

  /** Optional list of operators to restrict for this field. If omitted, all operators for the type are available. */
  operators?: FilterOperator[];

  /**
   * Normalizes a raw value from the row into something that can be used
   * for generic filtering / searching.
   *
   * @remarks
   * Used to transform complex field values into filterable primitives.
   * For example, converting a date object to a timestamp or extracting
   * a nested property value.
   *
   * @param value - The raw field value from the row
   * @param row - The complete row object for context
   * @returns The normalized value suitable for filtering
   */
  normalize?: (value: TValue, row: TRow) => string | number | boolean | null;

  /**
   * Optional list of static options (for select / multiSelect).
   *
   * @remarks
   * When provided, these options will be presented to the user for selection.
   * Each option contains a value and a human-readable label.
   * {@link FilterOption}
   */
  options?: FilterOption[];
}

/**
 * Active filters at list level.
 * Keyed by field id (or custom logical id).
 *
 * @remarks
 * Maps field identifiers to their current filter values. The structure
 * of each value depends on the filter type and operator being used.
 *
 * @public
 */
export type ActiveFilterState = Record<string, unknown>;
