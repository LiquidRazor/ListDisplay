import React from "react";
import type { TableProps } from "../../types";
import { ListHeader } from "./ListHeader";
import { ListBody } from "./ListBody";

/**
 * Default table layout for the list.
 */
export const ListTable: React.FC<TableProps> = ({
                                                    state,
                                                    fields,
                                                    idKey,
                                                    rowActions,
                                                    onRowActionClick,
                                                }) => {
    const hasRowActions = Boolean(rowActions && rowActions.length > 0);

    return (
        <div className="ld-list__table-wrapper">
            <table className="ld-list__table">
                <ListHeader fields={fields} hasRowActions={hasRowActions} />
                <ListBody
                    state={state}
                    fields={fields}
                    idKey={idKey}
                    rowActions={rowActions}
                    onRowActionClick={onRowActionClick}
                />
            </table>
        </div>
    );
};

export default ListTable;
