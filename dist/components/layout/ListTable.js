import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListHeader } from "./ListHeader";
import { ListBody } from "./ListBody";
/**
 * Default table layout for the list.
 */
export const ListTable = ({ state, fields, idKey, rowActions, onRowActionClick, }) => {
    const hasRowActions = Boolean(rowActions && rowActions.length > 0);
    return (_jsx("div", { className: "ld-list__table-wrapper", children: _jsxs("table", { className: "ld-list__table", children: [_jsx(ListHeader, { fields: fields, hasRowActions: hasRowActions }), _jsx(ListBody, { state: state, fields: fields, idKey: idKey, rowActions: rowActions, onRowActionClick: onRowActionClick })] }) }));
};
export default ListTable;
//# sourceMappingURL=ListTable.js.map