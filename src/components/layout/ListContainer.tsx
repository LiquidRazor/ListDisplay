/**
 * List container component module.
 *
 * @remarks
 * This module contains the ListContainer component responsible for providing
 * the root container wrapper for list layout structures.
 *
 * @packageDocumentation
 * @internal
 */

import React from "react";

/**
 * Props for the ListContainer component.
 *
 * @internal
 */
export interface ListContainerProps {
  /** Optional CSS class name to override default container styling */
  className?: string;
  /** Child elements to be rendered within the container */
  children?: React.ReactNode;
}

/**
 * Renders the root container for list layout structures.
 *
 * @remarks
 * This component provides a wrapper div element that serves as the outermost
 * container for list components. It applies a default "ld-list" class name
 * unless a custom className is provided via props.
 *
 * @param props - The component props
 * @returns A div element wrapping the list content
 *
 * @internal
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
