/**
 * List error state component module.
 *
 * @remarks
 * This module contains the ListErrorState component responsible for rendering
 * an error state display when list data fails to load or encounters an error.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {StatusStateProps} from "../../types";

/**
 * Renders an error state display for list components.
 *
 * @remarks
 * This component displays an error message when data loading fails.
 * If no custom message is provided, a default error message is shown.
 *
 * @param props - The component props
 * @returns A div element containing the error state display
 *
 * @internal
 */
export const ListErrorState: React.FC<StatusStateProps> = ({ message }) => {
  return (
    <div className="ld-list-state ld-list-state--error">
      <p className="ld-list-state__message">
        {message ?? "An error occurred while loading the data."}
      </p>
    </div>
  );
};

export default ListErrorState;
