// src/components/layout/ListCell.tsx

import React from "react";
import type { FieldSchema } from "../../types";

export interface ListCellProps {
    row: any;
    rowIndex: number;
    field: FieldSchema<any>;
    isSelected: boolean;
}

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
