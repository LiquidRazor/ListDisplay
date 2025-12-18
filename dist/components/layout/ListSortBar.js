import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/ListSortBar.tsx
import React from "react";
/**
 * Minimal sort bar: renders a dropdown of sortable fields.
 */
export var ListSortBar = function (_a) {
    var _b, _c, _d, _e;
    var state = _a.state, fields = _a.fields, onChangeSort = _a.onChangeSort;
    if (!onChangeSort) {
        return null;
    }
    var sortableFields = fields.filter(function (f) { return f.sortable; });
    if (sortableFields.length === 0) {
        return null;
    }
    var currentFieldId = (_c = (_b = state.sort) === null || _b === void 0 ? void 0 : _b.field) !== null && _c !== void 0 ? _c : "";
    var currentDirection = (_e = (_d = state.sort) === null || _d === void 0 ? void 0 : _d.direction) !== null && _e !== void 0 ? _e : "asc";
    var handleFieldChange = function (event) {
        var fieldId = event.target.value;
        if (!fieldId) {
            onChangeSort("");
            return;
        }
        onChangeSort(fieldId);
    };
    var handleDirectionToggle = function () {
        if (!state.sort) {
            return;
        }
        onChangeSort(state.sort.field);
    };
    return (_jsxs("div", { className: "ld-list__sortbar", children: [_jsxs("label", { className: "ld-list__sortbar-field", children: [_jsx("span", { className: "ld-list__sortbar-label", children: "Sort by" }), _jsxs("select", { className: "ld-list__sortbar-select", value: currentFieldId, onChange: handleFieldChange, children: [_jsx("option", { value: "", children: "None" }), sortableFields.map(function (field) { return (_jsx("option", { value: String(field.id), children: field.label }, String(field.id))); })] })] }), currentFieldId && (_jsx("button", { type: "button", className: "ld-list__sortbar-direction ld-list__sortbar-direction--".concat(currentDirection), onClick: handleDirectionToggle, children: currentDirection === "asc" ? "↑" : "↓" }))] }));
};
export default ListSortBar;
//# sourceMappingURL=ListSortBar.js.map