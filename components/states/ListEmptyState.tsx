// src/components/states/ListEmptyState.tsx

import React from "react";
import type { StatusStateProps } from "../../types";

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
