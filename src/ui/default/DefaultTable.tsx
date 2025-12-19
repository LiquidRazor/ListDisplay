import React, { useMemo } from "react";
import { useListCtx } from "../../core/context/listContext";

/**
 * Props for configuring the DefaultTable component styling.
 *
 * @remarks
 * All properties are optional and allow customization of the table's appearance
 * through CSS class names applied to different parts of the table structure.
 *
 * @public
 */
type DefaultTableProps = {
    /**
     * CSS class name applied to the root table container element.
     *
     * @remarks
     * This wraps the entire table including header and body rows.
     */
    className?: string;

    /**
     * CSS class name applied to the header row container.
     *
     * @remarks
     * This is applied to the div element that contains all header cells.
     */
    headerClassName?: string;

    /**
     * CSS class name applied to each data row container.
     *
     * @remarks
     * This is applied to each div element that represents a row in the table body.
     */
    rowClassName?: string;

    /**
     * CSS class name applied to each individual cell (header and data cells).
     *
     * @remarks
     * This is applied to each div element that represents a cell within rows.
     */
    cellClassName?: string;

    /**
     * CSS class name applied to the actions column container.
     *
     * @remarks
     * This is applied to the header and cell containers that hold row action buttons.
     */
    actionsClassName?: string;
};

/**
 * A default table UI component for displaying list data with optional selection and row actions.
 *
 * @remarks
 * This is a provided default table implementation that can be used with the ListDisplay component.
 * While it's ready to use out of the box, it must be explicitly passed to ListDisplay as a component override.
 *
 * The DefaultTable component reads from the list context and automatically renders:
 * - Field columns based on meta.fields configuration
 * - Optional selection checkboxes (when selection feature is enabled)
 * - Optional row action buttons (when rowActions feature is enabled)
 * - Loading states with opacity changes
 *
 * The component uses flexible box layout (display: flex) and provides basic styling that can be
 * customized through the className props.
 *
 * @param props - Configuration props for styling the table
 *
 * @returns A React element representing the table structure
 *
 * @example
 * Basic usage with ListDisplay:
 * ```tsx
 * import { ListDisplay } from './core/components/ListDisplay';
 * import DefaultTable from './ui/default/DefaultTable';
 *
 * function MyList() {
 *   return (
 *     <ListDisplay
 *       components={{ Table: DefaultTable }}
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * With custom styling:
 * ```tsx
 * <ListDisplay
 *   components={{
 *     Table: (props) => (
 *       <DefaultTable
 *         className="custom-table"
 *         headerClassName="custom-header"
 *         rowClassName="custom-row"
 *         cellClassName="custom-cell"
 *         actionsClassName="custom-actions"
 *       />
 *     )
 *   }}
 * />
 * ```
 *
 * @public
 */
export default function DefaultTable(props: DefaultTableProps) {
    const { className, headerClassName, rowClassName, cellClassName, actionsClassName } = props;

    const ctx = useListCtx();
    const state = ctx.state;

    const fields = (ctx.meta?.fields as any[]) ?? [];
    const idKey = ctx.meta?.idKey as string | undefined;

    const selection = (ctx.features as any)?.selection;
    const rowActions = (ctx.features as any)?.rowActions;

    const hasSelection =
        selection && typeof selection.toggle === "function" && typeof selection.isSelected === "function";

    const hasRowActions =
        rowActions && typeof rowActions.getActions === "function" && typeof rowActions.triggerAt === "function";

    const actions = useMemo(() => (hasRowActions ? (rowActions.getActions() as any[]) : []), [hasRowActions, rowActions]);

    return (
        <div className={className}>
            <div className={headerClassName} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                {hasSelection ? <div style={{ width: 28 }} /> : null}

                {fields.map((f) => (
                    <div key={f.id} style={{ flex: 1 }} className={cellClassName}>
                        {f.label ?? f.id}
                    </div>
                ))}

                {hasRowActions ? <div className={actionsClassName} style={{ width: 120 }}>Actions</div> : null}
            </div>

            <div>
                {(state.rows ?? []).map((row: any, rowIndex: number) => {
                    const rowId = idKey ? row?.[idKey] : undefined;
                    const selected = hasSelection && rowId != null ? !!selection.isSelected(rowId) : false;

                    return (
                        <div
                            key={rowId ?? rowIndex}
                            className={rowClassName}
                            style={{
                                display: "flex",
                                gap: 12,
                                alignItems: "center",
                                opacity: state.status === "loading" ? 0.6 : 1,
                            }}
                        >
                            {hasSelection ? (
                                <div style={{ width: 28 }}>
                                    <input
                                        type="checkbox"
                                        checked={selected}
                                        onChange={() => {
                                            if (rowId == null) return;
                                            selection.toggle(rowId);
                                        }}
                                    />
                                </div>
                            ) : null}

                            {fields.map((f) => {
                                const content =
                                    typeof f.render === "function"
                                        ? f.render(row)
                                        : typeof f.value === "function"
                                            ? f.value(row)
                                            : row?.[f.id];

                                return (
                                    <div key={f.id} style={{ flex: 1 }} className={cellClassName}>
                                        {content as any}
                                    </div>
                                );
                            })}

                            {hasRowActions ? (
                                <div className={actionsClassName} style={{ width: 120, display: "flex", gap: 8 }}>
                                    {actions.map((a) => (
                                        <button key={a.id} type="button" onClick={() => rowActions.triggerAt(a.id, rowIndex)}>
                                            {a.label ?? a.id}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
