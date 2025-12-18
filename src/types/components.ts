import type { ComponentType } from "react";
import type { ListState } from "./listState";
import type { GeneralAction, RowAction } from "./actions";
import type { FieldSchema } from "./fieldSchema";

/* Props pentru componentele default / sloturi */

export interface ToolbarProps {
  state: ListState<any>;
  generalActions?: Array<GeneralAction<any, any>>;
  onActionClick?: (actionId: string) => void;
}

export interface FiltersPanelProps {
  state: ListState<any>;
  fields: Array<FieldSchema<any>>;
  onChangeFilters?: (next: unknown) => void;
}

export interface SortBarProps {
  state: ListState<any>;
  fields: Array<FieldSchema<any>>;
  onChangeSort?: (fieldId: string) => void;
}

export interface TableProps {
  state: ListState<any>;
  fields: Array<FieldSchema<any>>;
  idKey: string;
  rowActions?: Array<RowAction<any, any>>;
  onRowActionClick?: (actionId: string, rowIndex: number) => void;
}

export interface PaginationProps {
  state: ListState<any>;
  onChangePage?: (pageIndex: number) => void;
  onChangePageSize?: (pageSize: number) => void;
}

export interface ModalOutletProps {
  state: ListState<any>;
  generalActions?: Array<GeneralAction<any, any>>;
  rowActions?: Array<RowAction<any, any>>;
  onConfirm: (payload?: unknown) => void | Promise<void>;
  onCancel: () => void;
}

export interface StatusStateProps {
  message?: string;
}

/**
 * Mapping of overridable UI components ("slots").
 * Relaxed typing here since you control any overrides.
 */
export interface ListComponents {
  Toolbar?: ComponentType<any>;
  FiltersPanel?: ComponentType<any>;
  SortBar?: ComponentType<any>;
  Table?: ComponentType<any>;
  Pagination?: ComponentType<any>;
  ModalOutlet?: ComponentType<any>;
  LoadingState?: ComponentType<StatusStateProps>;
  EmptyState?: ComponentType<StatusStateProps>;
  ErrorState?: ComponentType<StatusStateProps>;
}

/**
 * Optional props bag for slot components.
 * Keyed by slot name.
 */
export type ListComponentsProps = Record<string, unknown>;
