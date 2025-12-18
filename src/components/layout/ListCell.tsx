/**
 * List cell component module.
 *
 * @remarks
 * This module contains the ListCell component responsible for rendering
 * individual table cells within a list row, including custom rendering and styling.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {FieldSchema} from "../../types";

/**
 * Props for the ListCell component.
 *
 * @internal
 */
export interface ListCellProps {
    /** The data object for the current row */
    row: any;
    /** The zero-based index of the row in the list */
    rowIndex: number;
    /** The field schema defining how to render this cell */
    field: FieldSchema<any>;
    /** Whether the row containing this cell is currently selected */
    isSelected: boolean;
}

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
export const ListCell: React.FC<ListCellProps> = ({
                                                      row,
                                                      rowIndex,
                                                      field,
                                                      isSelected,
                                                  }) => {
    const value = (row as any)[field.id];
    const style = field.cellStyle ? field.cellStyle(row, value) : undefined;

    let content: React.ReactNode = value as any;

    if (field.cellRenderer) {
        content = field.cellRenderer(row, value, {
            rowIndex,
            isSelected,
        });
    }

    return (
        <td
            className={`ld-list__cell ld-list__cell--${String(field.id)}`}
            style={style}
        >
            {content}
        </td>
    );
};

export default ListCell;
