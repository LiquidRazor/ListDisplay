// src/components/layout/ListBody.tsx

import React from "react";
import type {ListState, FieldSchema, RowAction} from "../../types";
import {ListRow} from "./ListRow";

export interface ListBodyProps {
    state: ListState<any>;
    fields: Array<FieldSchema<any>>;
    idKey: string;
    rowActions?: Array<RowAction<any, any>>;
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}

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
