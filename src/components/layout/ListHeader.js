import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const ListHeader = ({ fields, hasRowActions, }) => {
    return (_jsx("thead", { className: "ld-list__head", children: _jsxs("tr", { className: "ld-list__head-row", children: [fields.map((field) => (_jsx("th", { className: `ld-list__head-cell ld-list__head-cell--${field.id}`, style: field.headerStyle, children: field.label }, field.id))), hasRowActions && (_jsx("th", { className: "ld-list__head-cell ld-list__head-cell--actions" }))] }) }));
};
export default ListHeader;
