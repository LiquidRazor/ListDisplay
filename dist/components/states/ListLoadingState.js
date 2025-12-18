import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/states/ListLoadingState.tsx
import React from "react";
export var ListLoadingState = function (_a) {
    var message = _a.message;
    return (_jsxs("div", { className: "ld-list-state ld-list-state--loading", children: [_jsx("div", { className: "ld-list-state__spinner", "aria-hidden": "true" }), _jsx("p", { className: "ld-list-state__message", children: message !== null && message !== void 0 ? message : "Loading data..." })] }));
};
export default ListLoadingState;
//# sourceMappingURL=ListLoadingState.js.map