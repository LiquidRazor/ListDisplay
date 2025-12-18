import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Basic container for the list layout.
 */
export const ListContainer = ({ className, children, }) => {
    return (_jsx("div", { className: className ?? "ld-list", children: children }));
};
export default ListContainer;
