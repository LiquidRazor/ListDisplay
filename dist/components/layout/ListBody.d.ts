import React from "react";
import type { ListState, FieldSchema, RowAction } from "../../types";
export interface ListBodyProps {
    state: ListState<any>;
    fields: Array<FieldSchema<any>>;
    idKey: string;
    rowActions?: Array<RowAction<any, any>>;
    onRowActionClick?: (actionId: string, rowIndex: number) => void;
}
export declare const ListBody: React.FC<ListBodyProps>;
export default ListBody;
//# sourceMappingURL=ListBody.d.ts.map