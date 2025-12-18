import React from "react";
import type { FieldSchema } from "../../types";
export interface ListCellProps {
    row: any;
    rowIndex: number;
    field: FieldSchema<any>;
    isSelected: boolean;
}
export declare const ListCell: React.FC<ListCellProps>;
export default ListCell;
//# sourceMappingURL=ListCell.d.ts.map