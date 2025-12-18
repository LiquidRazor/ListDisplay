// src/components/layout/ListContainer.tsx

import React from "react";

export interface ListContainerProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * Basic container for the list layout.
 */
export const ListContainer: React.FC<ListContainerProps> = ({
  className,
  children,
}) => {
  return (
    <div className={className ?? "ld-list"}>
      {children}
    </div>
  );
};

export default ListContainer;
