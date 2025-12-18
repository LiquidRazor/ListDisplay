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
 * Initializes a selection state.
 */
export var createSelectionState = function (mode) {
    if (mode === void 0) { mode = "none"; }
    return ({
        mode: mode,
        selectedIds: [],
    });
};
export var isRowSelected = function (row, selection, ctx) {
    var id = row[ctx.idKey];
    return selection.selectedIds.includes(id);
};
export var toggleRowSelection = function (row, selection, ctx) {
    var mode = ctx.mode;
    var id = row[ctx.idKey];
    if (mode === "none") {
        return selection;
    }
    if (mode === "single") {
        var isSelected = selection.selectedIds.includes(id);
        return __assign(__assign({}, selection), { selectedIds: isSelected ? [] : [id] });
    }
    // multiple
    var exists = selection.selectedIds.includes(id);
    if (exists) {
        return __assign(__assign({}, selection), { selectedIds: selection.selectedIds.filter(function (x) { return x !== id; }) });
    }
    return __assign(__assign({}, selection), { selectedIds: __spreadArray(__spreadArray([], selection.selectedIds, true), [id], false) });
};
export var clearSelection = function (selection) { return (__assign(__assign({}, selection), { selectedIds: [] })); };
export var selectAllVisible = function (visibleRows, selection, ctx) {
    if (ctx.mode === "none") {
        return selection;
    }
    var newIds = visibleRows.map(function (row) { return row[ctx.idKey]; });
    if (ctx.mode === "single") {
        return __assign(__assign({}, selection), { selectedIds: newIds.length > 0 ? [newIds[0]] : [] });
    }
    // multiple
    return __assign(__assign({}, selection), { selectedIds: newIds });
};
//# sourceMappingURL=selection.js.map