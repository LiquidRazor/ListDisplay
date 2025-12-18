import { jsx as _jsx } from "react/jsx-runtime";
export const ListEmptyState = ({ message }) => {
    return (_jsx("div", { className: "ld-list-state ld-list-state--empty", children: _jsx("p", { className: "ld-list-state__message", children: message ?? "No data to display." }) }));
};
export default ListEmptyState;
