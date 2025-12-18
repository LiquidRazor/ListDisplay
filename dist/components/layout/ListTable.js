import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListHeader } from "./ListHeader";
import { ListBody } from "./ListBody";
/**
 * Renders the main table structure for a list view.
 *
 * @remarks
 * This component serves as the default table layout, wrapping the table structure
 * and coordinating the rendering of the header and body sections. It automatically
 * determines if row actions should be displayed based on the provided rowActions prop.
 *
 * @param props - The component props conforming to TableProps interface
 * @returns A div wrapper containing the complete table structure
 *
 * @internal
 */
export const ListTable = ({ state, fields, idKey, rowActions, onRowActionClick, }) => {
    const hasRowActions = Boolean(rowActions && rowActions.length > 0);
    return (_jsx("div", { className: "ld-list__table-wrapper", children: _jsxs("table", { className: "ld-list__table", children: [_jsx(ListHeader, { fields: fields, hasRowActions: hasRowActions }), _jsx(ListBody, { state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: onRowActionClick })] }) }));
};
export default ListTable;
//# sourceMappingURL=ListTable.js.map