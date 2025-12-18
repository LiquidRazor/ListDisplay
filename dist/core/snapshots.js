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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
/**
 * Builds an immutable snapshot of the current list state.
 */
export var buildSnapshot = function (state) {
    return {
        rowsAll: __spreadArray([], state.rawRows, true),
        rowsVisible: __spreadArray([], state.rows, true),
        filters: __assign({}, state.filters),
        sort: state.sort ? __assign({}, state.sort) : undefined,
        pagination: __assign({}, state.pagination),
        selection: {
            mode: state.selection.mode,
            selectedIds: __spreadArray([], state.selection.selectedIds, true),
        },
    };
};
//# sourceMappingURL=snapshots.js.map