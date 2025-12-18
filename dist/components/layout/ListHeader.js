import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Renders the header section of a list table.
 *
 * @remarks
 * This component renders the thead element containing column headers based on field schemas.
 * If row actions are present, an additional empty header cell is rendered for the actions column.
 *
 * @param props - The component props
 * @returns A thead element with header row and cells
 *
 * @internal
 */
export const ListHeader = ({ fields, hasRowActions, }) => {
    return (_jsx("thead", { className: "ld-list__head", children: _jsxs("tr", { className: "ld-list__head-row", children: [fields.map((field) => (_jsx("th", { className: `ld-list__head-cell ld-list__head-cell--${field.id}`, style: field.headerStyle, children: field.label }, field.id))), hasRowActions && (_jsx("th", { className: "ld-list__head-cell ld-list__head-cell--actions" }))] }) }));
};
export default ListHeader;
//# sourceMappingURL=ListHeader.js.map