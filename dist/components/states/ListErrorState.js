import { jsx as _jsx } from "react/jsx-runtime";
// src/components/states/ListErrorState.tsx
import React from "react";
export var ListErrorState = function (_a) {
    var message = _a.message;
    return (_jsx("div", { className: "ld-list-state ld-list-state--error", children: _jsx("p", { className: "ld-list-state__message", children: message !== null && message !== void 0 ? message : "An error occurred while loading the data." }) }));
};
export default ListErrorState;
//# sourceMappingURL=ListErrorState.js.map