import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/ListTable.tsx
import React from "react";
import { ListHeader } from "./ListHeader";
import { ListBody } from "./ListBody";
/**
 * Default table layout for the list.
 */
export var ListTable = function (_a) {
    var state = _a.state, fields = _a.fields, idKey = _a.idKey, rowActions = _a.rowActions, onRowActionClick = _a.onRowActionClick;
    var hasRowActions = Boolean(rowActions && rowActions.length > 0);
    return (_jsx("div", { className: "ld-list__table-wrapper", children: _jsxs("table", { className: "ld-list__table", children: [_jsx(ListHeader, { fields: fields, hasRowActions: hasRowActions }), _jsx(ListBody, { state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: onRowActionClick })] }) }));
};
export default ListTable;
//# sourceMappingURL=ListTable.js.map