import type { ReactNode } from "react";
import type { ModalConfig } from "./modal";
import type {
  GeneralActionContext,
  RowActionContext,
} from "./actionContext";

export type ActionKind =
  | "default"
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

export interface ListActionBase<TRow = any, TRowId = string | number> {
  id: string;
  label: string;
  icon?: ReactNode;
  kind?: ActionKind;

  /**
   * Whether this action conceptually owns a modal (confirm/custom).
   */
  opensModal?: boolean;

  /**
   * Modal configuration if the action requires one.
   */
  modal?: ModalConfig<TRow, TRowId>;
}

export interface GeneralAction<TRow = any, TRowId = string | number>
  extends ListActionBase<TRow, TRowId> {
  /**
   * Whether a non-empty selection is required for this action.
   */
  requiresSelection?: boolean;

  /**
   * Handler executed when the action is triggered (after any modal
   * interaction, if applicable).
   */
  handler?: (
    ctx: GeneralActionContext<TRow, TRowId>
  ) => void | Promise<void>;
}

export interface RowAction<TRow = any, TRowId = string | number>
  extends ListActionBase<TRow, TRowId> {
  /**
   * Handler executed for a specific row.
   */
  handler?: (ctx: RowActionContext<TRow, TRowId>) => void | Promise<void>;
}
