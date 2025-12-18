/**
 * List body component module.
 *
 * @remarks
 * This module contains the ListBody component responsible for rendering
 * the tbody element of a list table, including rows and empty state handling.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {ListState, FieldSchema, RowAction} from "../../types";
import {ListRow} from "./ListRow";

/**
 * Props for the ListBody component.
 *
 * @internal
 */
export interface ListBodyProps {
    /** The current state of the list including rows and metadata */
    state: ListState<any>;
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<any>>;
    /** The key used to uniquely identify each row */
    idKey: string;
    /** Optional array of actions available for each row */
    rowActions?: Array<RowAction<any, any>>;
    /** Optional callback function triggered when a row action is clicked */
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}

/**
 * Renders the body section of a list table.
 *
 * @remarks
 * This component renders the tbody element containing all data rows or an empty state
 * when no data is available. It delegates individual row rendering to the ListRow component.
 *
 * @param props - The component props
 * @returns A tbody element with rows or empty state
 *
 * @internal
 */
export const ListBody: React.FC<ListBodyProps> = ({
                                                      state,
                                                      fields,
                                                      idKey,
                                                      rowActions,
                                                      onRowActionClick,
                                                  }) => {
    if (!state.rows || state.rows.length === 0) {
        return (
            <tbody className="ld-list__body ld-list__body--empty">
            <tr className="ld-list__row ld-list__row--empty">
                <td
                    className="ld-list__cell ld-list__cell--empty"
                    colSpan={fields.length + (rowActions && rowActions.length > 0 ? 1 : 0)}
                />
            </tr>
            </tbody>
        );
    }

    return (
        <tbody className="ld-list__body">
        {state.rows.map((row, index) => (
            <ListRow
                key={String((row as any)[idKey])}
                row={row}
                rowIndex={index}
                fields={fields}
                state={state}
                idKey={idKey}
                rowActions={rowActions}
                onRowActionClick={onRowActionClick}
            />
        ))}
        </tbody>
    );
};

export default ListBody;
