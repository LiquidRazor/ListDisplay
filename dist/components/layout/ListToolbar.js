import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/layout/ListToolbar.tsx
import React from "react";
/**
 * Default toolbar: renders general actions as buttons.
 */
export var ListToolbar = function (_a) {
    var state = _a.state, generalActions = _a.generalActions, onActionClick = _a.onActionClick;
    if (!generalActions || generalActions.length === 0) {
        return null;
    }
    return (_jsx("div", { className: "ld-list__toolbar", children: generalActions.map(function (action) {
            var _a;
            return (_jsxs("button", { type: "button", className: "ld-list__toolbar-button ld-list__toolbar-button--".concat((_a = action.kind) !== null && _a !== void 0 ? _a : "default"), onClick: function () { return onActionClick === null || onActionClick === void 0 ? void 0 : onActionClick(action.id); }, disabled: state.status === "loading" || state.status === "streaming", children: [action.icon && (_jsx("span", { className: "ld-list__toolbar-button-icon", children: action.icon })), _jsx("span", { className: "ld-list__toolbar-button-label", children: action.label })] }, action.id));
        }) }));
};
export default ListToolbar;
//# sourceMappingURL=ListToolbar.js.map