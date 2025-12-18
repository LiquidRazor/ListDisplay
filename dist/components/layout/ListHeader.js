import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/ListHeader.tsx
import React from "react";
export var ListHeader = function (_a) {
    var fields = _a.fields, hasRowActions = _a.hasRowActions;
    return (_jsx("thead", { className: "ld-list__head", children: _jsxs("tr", { className: "ld-list__head-row", children: [fields.map(function (field) { return (_jsx("th", { className: "ld-list__head-cell ld-list__head-cell--".concat(field.id), style: field.headerStyle, children: field.label }, field.id)); }), hasRowActions && (_jsx("th", { className: "ld-list__head-cell ld-list__head-cell--actions" }))] }) }));
};
export default ListHeader;
//# sourceMappingURL=ListHeader.js.map