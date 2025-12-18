import React from "react";
import type { StatusStateProps } from "../../types";

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
