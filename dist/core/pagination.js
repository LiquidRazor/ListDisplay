var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
/**
 * Recomputes pagination metadata based on the current rows.
 */
export var updatePaginationMeta = function (pagination, totalItems) {
    var pageSize = pagination.pageSize > 0 ? pagination.pageSize : 10;
    var totalPages = totalItems === 0 ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));
    var pageIndex = pagination.pageIndex;
    if (pageIndex < 0)
        pageIndex = 0;
    if (pageIndex >= totalPages)
        pageIndex = totalPages - 1;
    return __assign(__assign({}, pagination), { pageIndex: pageIndex, totalItems: totalItems, totalPages: totalPages });
};
/**
 * Slices the rows according to the pagination state.
 */
export var applyPagination = function (rows, pagination) {
    var pageIndex = pagination.pageIndex, pageSize = pagination.pageSize;
    if (pageSize <= 0) {
        return rows;
    }
    var start = pageIndex * pageSize;
    var end = start + pageSize;
    return rows.slice(start, end);
};
//# sourceMappingURL=pagination.js.map