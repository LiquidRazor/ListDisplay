import React from "react";
import type { StatusStateProps } from "../../types";

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
