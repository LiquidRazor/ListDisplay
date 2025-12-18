import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListCell } from "./ListCell";
const isSelectedRow = (row, selection, idKey) => {
    const id = row[idKey];
    return selection.selectedIds.includes(id);
};
export const ListRow = ({ row, rowIndex, fields, state, idKey, rowActions, onRowActionClick, }) => {
    const selected = isSelectedRow(row, state.selection, idKey);
    return (_jsxs("tr", { className: selected
            ? "ld-list__row ld-list__row--selected"
            : "ld-list__row", children: [fields.map((field) => (_jsx(ListCell, { row: row, rowIndex: rowIndex, field: field, isSelected: selected }, String(field.id)))), rowActions && rowActions.length > 0 && (_jsx("td", { className: "ld-list__cell ld-list__cell--actions", children: _jsx("div", { className: "ld-list__row-actions", children: rowActions.map((action) => (_jsxs("button", { type: "button", className: `ld-list__row-action ld-list__row-action--${action.kind ?? "default"}`, onClick: () => onRowActionClick?.(action.id, rowIndex), children: [action.icon && (_jsx("span", { className: "ld-list__row-action-icon", children: action.icon })), _jsx("span", { className: "ld-list__row-action-label", children: action.label })] }, action.id))) }) }))] }));
};
export default ListRow;
//# sourceMappingURL=ListRow.js.map