import React from "react";
import type {FieldSchema, ListState, RowAction, RowId, SelectionState} from "../../types";
import {ListCell} from "./ListCell";

export interface ListRowProps {
    row: any;
    rowIndex: number;
    fields: Array<FieldSchema<any>>;
    state: ListState<any>;
    idKey: string;
    rowActions?: Array<RowAction<any, any>>;
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}

const isSelectedRow = (
    row: any,
    selection: SelectionState<RowId>,
    idKey: string
): boolean => {
    const id = (row as any)[idKey] as RowId;
    return selection.selectedIds.includes(id);
};

export const ListRow: React.FC<ListRowProps> = (
    {
        row,
        rowIndex,
        fields,
        state,
        idKey,
        rowActions,
        onRowActionClick,
    }
) => {
    const selected = isSelectedRow(row, state.selection as any, idKey);

    return (
        <tr
            className={
                selected
                    ? "ld-list__row ld-list__row--selected"
                    : "ld-list__row"
            }
        >
            {fields.map((field) => (
                <ListCell
                    key={String(field.id)}
                    row={row}
                    rowIndex={rowIndex}
                    field={field}
                    isSelected={selected}
                />
            ))}

            {rowActions && rowActions.length > 0 && (
                <td className="ld-list__cell ld-list__cell--actions">
                    <div className="ld-list__row-actions">
                        {rowActions.map((action) => (
                            <button
                                key={action.id}
                                type="button"
                                className={`ld-list__row-action ld-list__row-action--${
                                    action.kind ?? "default"
                                }`}
                                onClick={() => onRowActionClick?.(action.id, rowIndex)}
                            >
                                {action.icon && (
                                    <span className="ld-list__row-action-icon">
                    {action.icon}
                  </span>
                                )}
                                <span className="ld-list__row-action-label">
                  {action.label}
                </span>
                            </button>
                        ))}
                    </div>
                </td>
            )}
        </tr>
    );
};

export default ListRow;
