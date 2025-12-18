import type { CSSProperties, ReactNode } from "react";
import type { FieldFilterConfig } from "./filters";
export type FieldAlign = "left" | "center" | "right";
export interface CellRenderContext<TRow = any> {
    rowIndex: number;
    isSelected: boolean;
}
/**
 * Column/field definition for the list.
 */
export interface FieldSchema<TRow = any, TValue = any> {
    /**
     * Property name on the row object.
     */
    id: keyof TRow & string;
    /**
     * Label shown in the header.
     */
    label: string;
    /**
     * Whether the column can be sorted.
     */
    sortable?: boolean;
    /**
     * Filter configuration for this column.
     */
    filter?: FieldFilterConfig<TRow, TValue>;
    /**
     * Preferred width (px, %, etc).
     */
    width?: number | string;
    /**
     * Minimum width for the column.
     */
    minWidth?: number | string;
    /**
     * Text / cell alignment.
     */
    align?: FieldAlign;
    /**
     * Optional custom renderer for the cell.
     */
    cellRenderer?: (row: TRow, value: TValue, ctx: CellRenderContext<TRow>) => ReactNode;
    /**
     * Dynamic style for the cell (e.g. based on status).
     */
    cellStyle?: (row: TRow, value: TValue) => CSSProperties;
    /**
     * Optional header cell style.
     */
    headerStyle?: CSSProperties;
}
//# sourceMappingURL=fieldSchema.d.ts.map