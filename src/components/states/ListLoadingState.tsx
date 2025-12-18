/**
 * List loading state component module.
 *
 * @remarks
 * This module contains the ListLoadingState component responsible for rendering
 * a loading indicator with an optional message while data is being fetched.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";
import type {StatusStateProps} from "../../types";

/**
 * Renders a loading state indicator for lists.
 *
 * @remarks
 * This component displays a spinner animation along with a customizable message
 * to inform users that data is being loaded. The message defaults to "Loading data..."
 * if not provided.
 *
 * @param props - The component props
 * @returns A div element containing a spinner and loading message
 *
 * @internal
 */
export const ListLoadingState: React.FC<StatusStateProps> = ({ message }) => {
  return (
    <div className="ld-list-state ld-list-state--loading">
      <div className="ld-list-state__spinner" aria-hidden="true" />
      <p className="ld-list-state__message">
        {message ?? "Loading data..."}
      </p>
    </div>
  );
};

export default ListLoadingState;
