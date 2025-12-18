import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ListCell } from "./ListCell";
/**
 * Determines whether a row is currently selected.
 *
 * @remarks
 * This helper function checks if a row's ID is present in the selection state's
 * selectedIds array to determine if the row should be rendered as selected.
 *
 * @param row - The row data object
 * @param selection - The current selection state containing selected IDs
 * @param idKey - The key used to extract the row's unique identifier
 * @returns True if the row is selected, false otherwise
 *
 * @internal
 */
const isSelectedRow = (row, selection, idKey) => {
    const id = row[idKey];
    return selection.selectedIds.includes(id);
};
/**
 * Renders an individual row within a list table.
 *
 * @remarks
 * This component renders a tr element containing cells for each field and optional
 * row actions. It handles row selection state and applies appropriate styling classes.
 * Each cell is rendered using the ListCell component, and row actions are rendered
 * as buttons within a dedicated actions cell.
 *
 * @param props - The component props
 * @returns A tr element containing cells and optional action buttons
 *
 * @internal
 */
export const ListRow = ({ row, rowIndex, fields, state, idKey, rowActions, onRowActionClick, }) => {
    const selected = isSelectedRow(row, state.selection, idKey);
    return (_jsxs("tr", { className: selected
            ? "ld-list__row ld-list__row--selected"
            : "ld-list__row", children: [fields.map((field) => (_jsx(ListCell, { row: row, rowIndex: rowIndex, field: field, isSelected: selected }, String(field.id)))), rowActions && rowActions.length > 0 && (_jsx("td", { className: "ld-list__cell ld-list__cell--actions", children: _jsx("div", { className: "ld-list__row-actions", children: rowActions.map((action) => (_jsxs("button", { type: "button", className: `ld-list__row-action ld-list__row-action--${action.kind ?? "default"}`, onClick: () => onRowActionClick?.(action.id, rowIndex), children: [action.icon && (_jsx("span", { className: "ld-list__row-action-icon", children: action.icon })), _jsx("span", { className: "ld-list__row-action-label", children: action.label })] }, action.id))) }) }))] }));
};
export default ListRow;
//# sourceMappingURL=ListRow.js.map