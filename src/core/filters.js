/**
 * Tries to normalize the active filter value into a standard structure.
 * We support:
 *  - primitive (e.g. "foo")  => equals
 *  - { value, operator }     => single-value
 *  - { from, to }            => between
 */
const resolveFilterValue = (rawValue, defaultType) => {
    if (rawValue == null) {
        return null;
    }
    // object-based filter
    if (typeof rawValue === "object") {
        const obj = rawValue;
        if (obj.operator && "value" in obj) {
            return {
                operator: obj.operator,
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
const getFieldFilterConfig = (field) => {
    return field.filter;
};
const buildResolvedFilters = (filters, fields) => {
    const resolved = [];
    for (const [fieldId, rawValue] of Object.entries(filters)) {
        const field = fields.find((f) => f.id === fieldId);
        if (!field || rawValue == null)
            continue;
        const filterConfig = getFieldFilterConfig(field);
        const type = filterConfig?.type ?? "text";
        const resolvedValue = resolveFilterValue(rawValue, type);
        if (!resolvedValue)
            continue;
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
const normalizeValue = (value, row, config) => {
    if (config?.normalize) {
        return config.normalize(value, row);
    }
    return value;
};
const toComparable = (value) => {
    if (value instanceof Date) {
        return value.getTime();
    }
    return value;
};
const applyOperator = (operator, normalizedValue, filterValue, filterValueTo) => {
    const v = toComparable(normalizedValue);
    const fv = toComparable(filterValue);
    const fv2 = toComparable(filterValueTo);
    switch (operator) {
        case "equals":
            return v === fv;
        case "notEquals":
            return v !== fv;
        case "contains":
            return (typeof v === "string" &&
                typeof fv === "string" &&
                v.toLowerCase().includes(fv.toLowerCase()));
        case "startsWith":
            return (typeof v === "string" &&
                typeof fv === "string" &&
                v.toLowerCase().startsWith(fv.toLowerCase()));
        case "endsWith":
            return (typeof v === "string" &&
                typeof fv === "string" &&
                v.toLowerCase().endsWith(fv.toLowerCase()));
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
            if (fv == null || fv2 == null)
                return false;
            return v >= fv && v <= fv2;
        default:
            return true;
    }
};
/**
 * Builds a predicate that evaluates whether a row passes all active filters.
 */
export const buildFilterPredicate = (ctx) => {
    const { filters, fields } = ctx;
    const resolved = buildResolvedFilters(filters, fields);
    if (resolved.length === 0) {
        return () => true;
    }
    return (row) => {
        for (const filter of resolved) {
            const field = fields.find((f) => f.id === filter.fieldId);
            if (!field)
                continue;
            const value = row[field.id];
            const normalized = normalizeValue(value, row, filter.config);
            const ok = applyOperator(filter.operator, normalized, filter.value, filter.valueTo);
            if (!ok)
                return false;
        }
        return true;
    };
};
/**
 * Applies filters to a list of rows and returns the filtered array.
 */
export const applyFilters = (rows, ctx) => {
    const predicate = buildFilterPredicate(ctx);
    return rows.filter(predicate);
};
