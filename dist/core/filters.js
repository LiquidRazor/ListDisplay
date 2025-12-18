/**
 * Tries to normalize the active filter value into a standard structure.
 * We support:
 *  - primitive (e.g. "foo")  => equals
 *  - { value, operator }     => single-value
 *  - { from, to }            => between
 */
var resolveFilterValue = function (rawValue, defaultType) {
    if (rawValue == null) {
        return null;
    }
    // object-based filter
    if (typeof rawValue === "object") {
        var obj = rawValue;
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
var getFieldFilterConfig = function (field) {
    return field.filter;
};
var buildResolvedFilters = function (filters, fields) {
    var _a;
    var resolved = [];
    var _loop_1 = function (fieldId, rawValue) {
        var field = fields.find(function (f) { return f.id === fieldId; });
        if (!field || rawValue == null)
            return "continue";
        var filterConfig = getFieldFilterConfig(field);
        var type = (_a = filterConfig === null || filterConfig === void 0 ? void 0 : filterConfig.type) !== null && _a !== void 0 ? _a : "text";
        var resolvedValue = resolveFilterValue(rawValue, type);
        if (!resolvedValue)
            return "continue";
        resolved.push({
            fieldId: fieldId,
            type: type,
            operator: resolvedValue.operator,
            value: resolvedValue.value,
            valueTo: resolvedValue.valueTo,
            config: filterConfig,
        });
    };
    for (var _i = 0, _b = Object.entries(filters); _i < _b.length; _i++) {
        var _c = _b[_i], fieldId = _c[0], rawValue = _c[1];
        _loop_1(fieldId, rawValue);
    }
    return resolved;
};
var normalizeValue = function (value, row, config) {
    if (config === null || config === void 0 ? void 0 : config.normalize) {
        return config.normalize(value, row);
    }
    return value;
};
var toComparable = function (value) {
    if (value instanceof Date) {
        return value.getTime();
    }
    return value;
};
var applyOperator = function (operator, normalizedValue, filterValue, filterValueTo) {
    var v = toComparable(normalizedValue);
    var fv = toComparable(filterValue);
    var fv2 = toComparable(filterValueTo);
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
export var buildFilterPredicate = function (ctx) {
    var filters = ctx.filters, fields = ctx.fields;
    var resolved = buildResolvedFilters(filters, fields);
    if (resolved.length === 0) {
        return function () { return true; };
    }
    return function (row) {
        var _loop_2 = function (filter) {
            var field = fields.find(function (f) { return f.id === filter.fieldId; });
            if (!field)
                return "continue";
            var value = row[field.id];
            var normalized = normalizeValue(value, row, filter.config);
            var ok = applyOperator(filter.operator, normalized, filter.value, filter.valueTo);
            if (!ok)
                return { value: false };
        };
        for (var _i = 0, resolved_1 = resolved; _i < resolved_1.length; _i++) {
            var filter = resolved_1[_i];
            var state_1 = _loop_2(filter);
            if (typeof state_1 === "object")
                return state_1.value;
        }
        return true;
    };
};
/**
 * Applies filters to a list of rows and returns the filtered array.
 */
export var applyFilters = function (rows, ctx) {
    var predicate = buildFilterPredicate(ctx);
    return rows.filter(predicate);
};
//# sourceMappingURL=filters.js.map