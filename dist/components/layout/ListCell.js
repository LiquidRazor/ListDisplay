import { jsx as _jsx } from "react/jsx-runtime";
export const ListCell = ({ row, rowIndex, field, isSelected, }) => {
    const value = row[field.id];
    const style = field.cellStyle ? field.cellStyle(row, value) : undefined;
    let content = value;
    if (field.cellRenderer) {
        content = field.cellRenderer(row, value, {
            rowIndex,
            isSelected,
        });
    }
    return (_jsx("td", { className: `ld-list__cell ld-list__cell--${String(field.id)}`, style: style, children: content }));
};
export default ListCell;
//# sourceMappingURL=ListCell.js.map