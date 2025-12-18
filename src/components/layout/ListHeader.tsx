import React from "react";
import type { FieldSchema } from "../../types";

export interface ListHeaderProps<TRow = any> {
  fields: Array<FieldSchema<TRow>>;
  hasRowActions: boolean;
}

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
