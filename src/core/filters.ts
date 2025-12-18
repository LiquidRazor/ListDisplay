// src/core/filters.ts
import type {
  ActiveFilterState,
  FieldFilterConfig,
  FilterOperator,
  FilterType,
    FieldSchema
} from "../types";

type AnyRow = any;

export interface FilterContext<TRow = AnyRow> {
  filters: ActiveFilterState;
  fields: Array<FieldSchema<TRow>>;
}

/**
 * Represents a single active filter for a field.
 */
interface ResolvedFilter {
  fieldId: string;
  type: FilterType;
  operator: FilterOperator;
  value: unknown;
  valueTo?: unknown;
  config?: FieldFilterConfig<any, any>;
}

/**
 * Tries to normalize the active filter value into a standard structure.
 * We support:
 *  - primitive (e.g. "foo")  => equals
 *  - { value, operator }     => single-value
 *  - { from, to }            => between
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

const getFieldFilterConfig = <TRow = AnyRow>(
  field: FieldSchema<TRow>
): FieldFilterConfig<TRow, any> | undefined => {
  return field.filter;
};

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

const toComparable = (value: unknown): any => {
  if (value instanceof Date) {
    return value.getTime();
  }
  return value;
};

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
 * Builds a predicate that evaluates whether a row passes all active filters.
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
 * Applies filters to a list of rows and returns the filtered array.
 */
export const applyFilters = <TRow = AnyRow>(
  rows: TRow[],
  ctx: FilterContext<TRow>
): TRow[] => {
  const predicate = buildFilterPredicate(ctx);
  return rows.filter(predicate);
};
