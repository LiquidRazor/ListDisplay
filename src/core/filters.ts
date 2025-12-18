/**
 * Core filtering module providing predicate building and filter application for list data.
 *
 * @packageDocumentation
 * @internal
 */

import type {
  ActiveFilterState,
  FieldFilterConfig,
  FilterOperator,
  FilterType,
  FieldSchema
} from "../types";

/**
 * Type alias for any row object.
 * @internal
 */
type AnyRow = any;

/**
 * Context object containing filter state and field schemas needed for filter evaluation.
 *
 * @typeParam TRow - The type of row objects being filtered
 * @internal
 */
export interface FilterContext<TRow = AnyRow> {
  /**
   * The current active filter state containing all applied filters.
   */
  filters: ActiveFilterState;

  /**
   * Array of field schemas that define the structure and filter configuration for each field.
   */
  fields: Array<FieldSchema<TRow>>;
}

/**
 * Represents a single active filter for a field after resolution and normalization.
 * Contains all information needed to evaluate the filter against row data.
 *
 * @internal
 */
interface ResolvedFilter {
  /**
   * The ID of the field this filter applies to.
   */
  fieldId: string;

  /**
   * The type of filter (text, number, date, boolean).
   */
  type: FilterType;

  /**
   * The comparison operator to use (equals, contains, gt, etc.).
   */
  operator: FilterOperator;

  /**
   * The primary filter value.
   */
  value: unknown;

  /**
   * Optional secondary value for range-based operators like "between".
   */
  valueTo?: unknown;

  /**
   * Optional field-specific filter configuration.
   */
  config?: FieldFilterConfig<any, any>;
}

/**
 * Normalizes raw filter values into a standard structure with operator and value(s).
 * Supports multiple input formats:
 *  - Primitive values (e.g. "foo") - mapped to type-appropriate operator
 *  - Object with `{ value, operator }` - explicit operator specification
 *  - Object with `{ from, to }` - converted to "between" operator
 *
 * @param rawValue - The raw filter value from user input or state
 * @param defaultType - The field type used to determine default operator for primitives
 * @returns Normalized filter structure with operator and value(s), or null if value is invalid
 * @internal
 */
const resolveFilterValue = (
  rawValue: unknown,
  defaultType: FilterType
): { operator: FilterOperator; value: unknown; valueTo?: unknown } | null => {
  if (rawValue == null) {
    return null;
  }

  // object-based filter
  if (typeof rawValue === "object") {
    const obj = rawValue as any;

    if (obj.operator && "value" in obj) {
      return {
        operator: obj.operator as FilterOperator,
        value: obj.value,
      };
    }

    if ("from" in obj || "to" in obj) {
      return {
        operator: "between",
        value: obj.from,
        valueTo: obj.to,
      };
    }
  }

  // primitive: default operator based on type
  switch (defaultType) {
    case "text":
      return { operator: "contains", value: rawValue };
    case "number":
    case "date":
      return { operator: "equals", value: rawValue };
    case "boolean":
      return { operator: "equals", value: rawValue };
    default:
      return { operator: "equals", value: rawValue };
  }
};

/**
 * Extracts the filter configuration from a field schema.
 *
 * @typeParam TRow - The type of row objects
 * @param field - The field schema to extract configuration from
 * @returns The field's filter configuration, or undefined if not configured
 * @internal
 */
const getFieldFilterConfig = <TRow = AnyRow>(
  field: FieldSchema<TRow>
): FieldFilterConfig<TRow, any> | undefined => {
  return field.filter;
};

/**
 * Builds an array of resolved filters by matching active filters with their field schemas
 * and normalizing their values into a standard evaluation structure.
 *
 * @typeParam TRow - The type of row objects
 * @param filters - The active filter state from user input
 * @param fields - Array of field schemas containing filter configurations
 * @returns Array of resolved filters ready for evaluation
 * @internal
 */
const buildResolvedFilters = <TRow = AnyRow>(
  filters: ActiveFilterState,
  fields: Array<FieldSchema<TRow>>
): ResolvedFilter[] => {
  const resolved: ResolvedFilter[] = [];

  for (const [fieldId, rawValue] of Object.entries(filters)) {
    const field = fields.find((f) => f.id === fieldId);
    if (!field || rawValue == null) continue;

    const filterConfig = getFieldFilterConfig(field);
    const type: FilterType = filterConfig?.type ?? "text";

    const resolvedValue = resolveFilterValue(rawValue, type);
    if (!resolvedValue) continue;

    resolved.push({
      fieldId,
      type,
      operator: resolvedValue.operator,
      value: resolvedValue.value,
      valueTo: resolvedValue.valueTo,
      config: filterConfig,
    });
  }

  return resolved;
};

/**
 * Normalizes a field value using the field's custom normalization function if provided.
 * This allows fields to transform values before comparison (e.g., case normalization, formatting).
 *
 * @typeParam TRow - The type of row objects
 * @typeParam TValue - The type of the field value
 * @param value - The raw value from the row
 * @param row - The complete row object (for context-aware normalization)
 * @param config - Optional field filter configuration containing normalization function
 * @returns The normalized value ready for comparison
 * @internal
 */
const normalizeValue = <TRow = AnyRow, TValue = any>(
  value: TValue,
  row: TRow,
  config?: FieldFilterConfig<TRow, TValue>
): unknown => {
  if (config?.normalize) {
    return config.normalize(value, row);
  }
  return value;
};

/**
 * Converts values to comparable primitives for consistent comparison operations.
 * Specifically handles Date objects by converting them to timestamps.
 *
 * @param value - The value to convert
 * @returns A comparable primitive value
 * @internal
 */
const toComparable = (value: unknown): any => {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value;
};

/**
 * Evaluates a filter operator against a normalized value and filter criteria.
 * Supports all standard operators including text matching, numeric comparison, and range checks.
 *
 * @param operator - The filter operator to apply
 * @param normalizedValue - The normalized value from the row
 * @param filterValue - The primary filter value to compare against
 * @param filterValueTo - Optional secondary value for range-based operators
 * @returns True if the value passes the filter, false otherwise
 * @internal
 */
const applyOperator = (
  operator: FilterOperator,
  normalizedValue: unknown,
  filterValue: unknown,
  filterValueTo?: unknown
): boolean => {
  const v = toComparable(normalizedValue);
  const fv = toComparable(filterValue);
  const fv2 = toComparable(filterValueTo);

  switch (operator) {
    case "equals":
      return v === fv;
    case "notEquals":
      return v !== fv;
    case "contains":
      return (
        typeof v === "string" &&
        typeof fv === "string" &&
        v.toLowerCase().includes(fv.toLowerCase())
      );
    case "startsWith":
      return (
        typeof v === "string" &&
        typeof fv === "string" &&
        v.toLowerCase().startsWith(fv.toLowerCase())
      );
    case "endsWith":
      return (
        typeof v === "string" &&
        typeof fv === "string" &&
        v.toLowerCase().endsWith(fv.toLowerCase())
      );
    case "in":
      return Array.isArray(filterValue) && filterValue.includes(v);
    case "gt":
      return v > fv;
    case "gte":
      return v >= fv;
    case "lt":
      return v < fv;
    case "lte":
      return v <= fv;
    case "between":
      if (fv == null || fv2 == null) return false;
      return v >= fv && v <= fv2;
    default:
      return true;
  }
};

/**
 * Builds a predicate function that evaluates whether a row passes all active filters.
 * The predicate performs AND logic across all filters (row must match all filters).
 * Returns a no-op predicate if no filters are active.
 *
 * @typeParam TRow - The type of row objects
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A predicate function that returns true if the row passes all filters
 * @internal
 */
export const buildFilterPredicate = <TRow = AnyRow>(
  ctx: FilterContext<TRow>
): ((row: TRow) => boolean) => {
  const { filters, fields } = ctx;
  const resolved = buildResolvedFilters(filters, fields);

  if (resolved.length === 0) {
    return () => true;
  }

  return (row: TRow) => {
    for (const filter of resolved) {
      const field = fields.find((f) => f.id === filter.fieldId);
      if (!field) continue;

      const value = (row as any)[field.id];
      const normalized = normalizeValue(value, row, filter.config);
      const ok = applyOperator(
        filter.operator,
        normalized,
        filter.value,
        filter.valueTo
      );

      if (!ok) return false;
    }
    return true;
  };
};

/**
 * Applies all active filters to a list of rows and returns the filtered array.
 * This is the primary entry point for filter evaluation.
 *
 * @typeParam TRow - The type of row objects
 * @param rows - The array of rows to filter
 * @param ctx - The filter context containing active filters and field schemas
 * @returns A new array containing only rows that pass all filters
 * @internal
 */
export const applyFilters = <TRow = AnyRow>(
  rows: TRow[],
  ctx: FilterContext<TRow>
): TRow[] => {
  const predicate = buildFilterPredicate(ctx);
  return rows.filter(predicate);
};
