/**
 * List empty state component module.
 *
 * @remarks
 * This module contains the ListEmptyState component responsible for rendering
 * an empty state message when a list has no data to display.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {StatusStateProps} from "../../types";

/**
 * Renders an empty state message for lists with no data.
 *
 * @remarks
 * This component displays a centered message indicating that there is no data
 * to display in the list. It uses a default message if none is provided via props.
 *
 * @param props - The component props
 * @returns A div element containing the empty state message
 *
 * @internal
 */
export const ListEmptyState: React.FC<StatusStateProps> = ({ message }) => {
  return (
    <div className="ld-list-state ld-list-state--empty">
      <p className="ld-list-state__message">
        {message ?? "No data to display."}
      </p>
    </div>
  );
};

export default ListEmptyState;
