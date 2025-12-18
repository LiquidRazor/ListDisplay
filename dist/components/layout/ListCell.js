import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Renders an individual cell within a list table row.
 *
 * @remarks
 * This component handles cell rendering with support for custom renderers,
 * custom styling, and selection state. It applies the field's cellRenderer
 * if provided, otherwise displays the raw field value.
 *
 * @param props - The component props
 * @returns A td element containing the rendered cell content
 *
 * @internal
 */
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