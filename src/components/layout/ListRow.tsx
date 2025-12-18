/**
 * List row component module.
 *
 * @remarks
 * This module contains the ListRow component responsible for rendering
 * individual table rows within a list, including cell rendering, selection state,
 * and row-level actions.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {FieldSchema, ListState, RowAction, RowId, SelectionState} from "../../types";
import {ListCell} from "./ListCell";

/**
 * Props for the ListRow component.
 *
 * @internal
 */
export interface ListRowProps {
    /** The data object for the current row */
    row: any;
    /** The zero-based index of the row in the list */
    rowIndex: number;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The current state of the list including selection and metadata */
    state: ListState<any>;
    /** The key used to uniquely identify this row */
    idKey: string;
    /** Optional array of actions available for this row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}

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
const isSelectedRow = (
    row: any,
    selection: SelectionState<RowId>,
    idKey: string
): boolean => {
    const id = (row as any)[idKey] as RowId;
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
