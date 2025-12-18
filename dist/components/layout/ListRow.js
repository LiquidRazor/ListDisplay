import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/ListRow.tsx
import React from "react";
import { ListCell } from "./ListCell";
var isSelectedRow = function (row, selection, idKey) {
    var id = row[idKey];
    return selection.selectedIds.includes(id);
};
export var ListRow = function (_a) {
    var row = _a.row, rowIndex = _a.rowIndex, fields = _a.fields, state = _a.state, idKey = _a.idKey, rowActions = _a.rowActions, onRowActionClick = _a.onRowActionClick;
    var selected = isSelectedRow(row, state.selection, idKey);
    return (_jsxs("tr", { className: selected
            ? "ld-list__row ld-list__row--selected"
            : "ld-list__row", children: [fields.map(function (field) { return (_jsx(ListCell, { row: row, rowIndex: rowIndex, field: field, isSelected: selected }, String(field.id))); }), rowActions && rowActions.length > 0 && (_jsx("td", { className: "ld-list__cell ld-list__cell--actions", children: _jsx("div", { className: "ld-list__row-actions", children: rowActions.map(function (action) {
                        var _a;
                        return (_jsxs("button", { type: "button", className: "ld-list__row-action ld-list__row-action--".concat((_a = action.kind) !== null && _a !== void 0 ? _a : "default"), onClick: function () { return onRowActionClick === null || onRowActionClick === void 0 ? void 0 : onRowActionClick(action.id, rowIndex); }, children: [action.icon && (_jsx("span", { className: "ld-list__row-action-icon", children: action.icon })), _jsx("span", { className: "ld-list__row-action-label", children: action.label })] }, action.id));
                    }) }) }))] }));
};
export default ListRow;
//# sourceMappingURL=ListRow.js.map