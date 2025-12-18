import type { CSSProperties, ReactNode } from "react";
import type { FieldFilterConfig } from "./filters";

/**
 * Text alignment options for field cells and headers.
 * @public
 */
export type FieldAlign = "left" | "center" | "right";

/**
 * Context object passed to custom cell renderers.
 * @public
 */
export interface CellRenderContext<TRow = any> {
  /**
   * The index of the row in the visible rows array.
   */
  rowIndex: number;

  /**
   * Whether the row is currently selected.
   */
  isSelected: boolean;
}

/**
 * Column/field definition for the list, describing how a field should be displayed and behave.
 * @public
 */
export interface FieldSchema<TRow = any, TValue = any> {
  /**
   * Property name on the row object. Must be a valid key of the row type.
   */
  id: keyof TRow & string;

  /**
   * Label shown in the header column.
   */
  label: string;

  /**
   * Whether the column can be sorted. When true, enables sort interaction on the column header.
   */
  sortable?: boolean;

  /**
   * Filter configuration for this column, enabling filtering capabilities.
   * {@link FieldFilterConfig}
   */
  filter?: FieldFilterConfig<TRow, TValue>;

  /**
   * Preferred width for the column (can be pixels, percentage, or other CSS units).
   */
  width?: number | string;

  /**
   * Minimum width for the column (can be pixels, percentage, or other CSS units).
   */
  minWidth?: number | string;

  /**
   * Text and cell content alignment.
   * {@link FieldAlign}
   */
  align?: FieldAlign;

  /**
   * Optional custom renderer for the cell content. Receives the row, extracted value, and render context.
   * {@link CellRenderContext}
   */
  cellRenderer?: (
      row: TRow,
      value: TValue,
      ctx: CellRenderContext<TRow>
  ) => ReactNode;

  /**
   * Dynamic style function for the cell, allowing conditional styling based on row data and value.
   */
  cellStyle?: (row: TRow, value: TValue) => CSSProperties;

  /**
   * Optional static style object for the header cell.
   */
  headerStyle?: CSSProperties;
}
