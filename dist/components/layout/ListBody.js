import { jsx as _jsx } from "react/jsx-runtime";
import { ListRow } from "./ListRow";
export const ListBody = ({ state, fields, idKey, rowActions, onRowActionClick, }) => {
    if (!state.rows || state.rows.length === 0) {
        return (_jsx("tbody", { className: "ld-list__body ld-list__body--empty", children: _jsx("tr", { className: "ld-list__row ld-list__row--empty", children: _jsx("td", { className: "ld-list__cell ld-list__cell--empty", colSpan: fields.length + (rowActions && rowActions.length > 0 ? 1 : 0) }) }) }));
    }
    return (_jsx("tbody", { className: "ld-list__body", children: state.rows.map((row, index) => (_jsx(ListRow, { row: row, rowIndex: index, fields: fields, state: state, idKey: idKey, rowActions: rowActions, onRowActionClick: onRowActionClick }, String(row[idKey])))) }));
};
export default ListBody;
//# sourceMappingURL=ListBody.js.map