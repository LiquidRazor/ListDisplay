var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var compareValues = function (a, b) {
    if (a == null && b == null)
        return 0;
    if (a == null)
        return 1;
    if (b == null)
        return -1;
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    var sa = String(a).toLowerCase();
    var sb = String(b).toLowerCase();
    if (sa < sb)
        return -1;
    if (sa > sb)
        return 1;
    return 0;
};
/**
 * Applies sorting to a list of rows.
 */
export var applySorting = function (rows, ctx) {
    var sort = ctx.sort;
    if (!sort) {
        return rows;
    }
    var field = sort.field, direction = sort.direction;
    return __spreadArray([], rows, true).sort(function (a, b) {
        var va = a[field];
        var vb = b[field];
        var cmp = compareValues(va, vb);
        return direction === "asc" ? cmp : -cmp;
    });
};
//# sourceMappingURL=sorting.js.map