import React from "react";
import type { FieldSchema, ListState, RowAction } from "../../types";
export interface ListRowProps {
    row: any;
    rowIndex: number;
    fields: Array<FieldSchema<any>>;
    state: ListState<any>;
    idKey: string;
    rowActions?: Array<RowAction<any, any>>;
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
export declare const ListRow: React.FC<ListRowProps>;
export default ListRow;
//# sourceMappingURL=ListRow.d.ts.map