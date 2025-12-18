import { jsx as _jsx } from "react/jsx-runtime";
// src/components/states/ListEmptyState.tsx
import React from "react";
export var ListEmptyState = function (_a) {
    var message = _a.message;
    return (_jsx("div", { className: "ld-list-state ld-list-state--empty", children: _jsx("p", { className: "ld-list-state__message", children: message !== null && message !== void 0 ? message : "No data to display." }) }));
};
export default ListEmptyState;
//# sourceMappingURL=ListEmptyState.js.map