/**
 * List header component module.
 *
 * @remarks
 * This module contains the ListHeader component responsible for rendering
 * the thead element of a list table, including column headers and action column header.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {FieldSchema} from "../../types";

/**
 * Props for the ListHeader component.
 *
 * @internal
 */
export interface ListHeaderProps<TRow = any> {
    /** Array of field schemas defining the columns to display */
    fields: Array<FieldSchema<TRow>>;
    /** Whether the list has row actions, which requires an additional action column header */
    hasRowActions: boolean;
}

/**
 * Renders the header section of a list table.
 *
 * @remarks
 * This component renders the thead element containing column headers based on field schemas.
 * If row actions are present, an additional empty header cell is rendered for the actions column.
 *
 * @param props - The component props
 * @returns A thead element with header row and cells
 *
 * @internal
 */
export const ListHeader = <TRow = any>({
  fields,
  hasRowActions,
}: ListHeaderProps<TRow>) => {
  return (
    <thead className="ld-list__head">
      <tr className="ld-list__head-row">
        {fields.map((field) => (
          <th
            key={field.id}
            className={`ld-list__head-cell ld-list__head-cell--${field.id}`}
            style={field.headerStyle}
          >
            {field.label}
          </th>
        ))}

        {hasRowActions && (
          <th className="ld-list__head-cell ld-list__head-cell--actions" />
        )}
      </tr>
    </thead>
  );
};

export default ListHeader;
