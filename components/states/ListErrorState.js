import { jsx as _jsx } from "react/jsx-runtime";
export const ListErrorState = ({ message }) => {
    return (_jsx("div", { className: "ld-list-state ld-list-state--error", children: _jsx("p", { className: "ld-list-state__message", children: message ?? "An error occurred while loading the data." }) }));
};
export default ListErrorState;
