import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ListLoadingState = ({ message }) => {
    return (_jsxs("div", { className: "ld-list-state ld-list-state--loading", children: [_jsx("div", { className: "ld-list-state__spinner", "aria-hidden": "true" }), _jsx("p", { className: "ld-list-state__message", children: message ?? "Loading data..." })] }));
};
export default ListLoadingState;
