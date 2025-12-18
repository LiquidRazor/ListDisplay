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
 * Extracts the id from a row based on the configured idKey.
 */
export var getRowId = function (row, idKey) {
    return row[idKey];
};
/**
 * Applies a single data patch to the current list of rows.
 */
export var applyPatch = function (rows, patch, idKey) {
    switch (patch.type) {
        case "replaceAll":
            return __spreadArray([], patch.rows, true);
        case "append":
            return __spreadArray(__spreadArray([], rows, true), [patch.row], false);
        case "update": {
            var targetId_1 = getRowId(patch.row, idKey);
            var changed_1 = false;
            var next = rows.map(function (row) {
                var rowId = getRowId(row, idKey);
                if (rowId === targetId_1) {
                    changed_1 = true;
                    return patch.row;
                }
                return row;
            });
            return changed_1 ? next : next;
        }
        case "remove": {
            var changed_2 = false;
            var next = rows.filter(function (row) {
                var rowId = getRowId(row, idKey);
                if (rowId === patch.id) {
                    changed_2 = true;
                    return false;
                }
                return true;
            });
            return changed_2 ? next : next;
        }
        default:
            return rows;
    }
};
/**
 * Applies a list of patches in order.
 */
export var applyPatches = function (rows, patches, idKey) {
    return patches.reduce(function (current, patch) { return applyPatch(current, patch, idKey); }, rows);
};
//# sourceMappingURL=patches.js.map