import { jsx as _jsx } from "react/jsx-runtime";
// src/components/layout/ListCell.tsx
import React from "react";
export var ListCell = function (_a) {
    var row = _a.row, rowIndex = _a.rowIndex, field = _a.field, isSelected = _a.isSelected;
    var value = row[field.id];
    var style = field.cellStyle ? field.cellStyle(row, value) : undefined;
    var content = value;
    if (field.cellRenderer) {
        content = field.cellRenderer(row, value, {
            rowIndex: rowIndex,
            isSelected: isSelected,
        });
    }
    return (_jsx("td", { className: "ld-list__cell ld-list__cell--".concat(String(field.id)), style: style, children: content }));
};
export default ListCell;
//# sourceMappingURL=ListCell.js.map