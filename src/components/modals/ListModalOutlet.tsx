/**
 * List modal outlet component module.
 *
 * @remarks
 * This module contains the ListModalOutlet component which provides default modal rendering
 * functionality for list actions. It supports confirm modals out of the box and provides
 * fallback handling for custom modals that require consumer implementation.
 *
 * @packageDocumentation
 * @public
 */

import React, {useMemo} from "react";
import type {GeneralAction, ModalConfig, ModalOutletProps, RowAction} from "../../types";
import {ConfirmModal} from "./ConfirmModal";

/**
 * Default modal outlet component for rendering action-triggered modals.
 *
 * @remarks
 * This component provides default modal rendering functionality for list actions.
 * It supports:
 * - Confirm modals (ModalConfig.type === "confirm") with customizable titles, descriptions, and button labels
 * - Fallback handling for missing action configurations
 * - Custom modal placeholders with instructions for consumer implementation
 *
 * For custom modals (ModalConfig.type === "custom"), consumers are expected to override
 * this component via the "ModalOutlet" slot in the list configuration and handle rendering themselves.
 *
 * @param props - The component props containing state, actions, and callbacks {@link ModalOutletProps}
 * @returns A modal component based on the active action configuration, or null if no modal is open
 *
 * @public
 */
export const ListModalOutlet: React.FC<ModalOutletProps> = (
    {
        state,
        generalActions,
        rowActions,
        onConfirm,
        onCancel,
    }
) => {
    const {ui} = state;
    const {modal, activeAction} = ui;

    if (!modal || !modal.isOpen || !modal.actionId) {
        return null;
    }

    const actionType: "general" | "row" | undefined = activeAction?.type
        ?? (modal.rowId != null ? "row" : "general");

    const {action, modalConfig} = useMemo(() => {
        let act: GeneralAction<any, any> | RowAction<any, any> | undefined;
        let config: ModalConfig<any, any> | undefined;

        if (actionType === "general") {
            act = (generalActions ?? []).find((a) => a.id === modal.actionId);
        } else if (actionType === "row") {
            act = (rowActions ?? []).find((a) => a.id === modal.actionId);
        }

        if (act && act.modal) {
            config = act.modal as ModalConfig<any, any>;
        }

        return {action: act, modalConfig: config};
    }, [actionType, modal.actionId, generalActions, rowActions]);

    // If the action is missing or lacks modal config, still show a minimal fallback.
    if (!action || !modalConfig) {
        return (
            <ConfirmModal
                title="Confirm action"
                description={
                    <span>
            Are you sure you want to execute this action?
          </span>
                }
                onConfirm={() => onConfirm()}
                onCancel={onCancel}
            />
        );
    }

    // Confirm modal configuration is fully supported here.
    if (modalConfig.type === "confirm") {
        return (
            <ConfirmModal
                title={modalConfig.title}
                description={modalConfig.description}
                confirmLabel={modalConfig.confirmLabel}
                cancelLabel={modalConfig.cancelLabel}
                onConfirm={() => onConfirm()}
                onCancel={onCancel}
            />
        );
    }

    // Custom modal handling is not implemented by default in the core.
    // The consumer can override ModalOutlet in config.components.ModalOutlet.
    if (modalConfig.type === "custom") {
        return (
            <div className="ld-modal ld-modal--backdrop">
                <div className="ld-modal__dialog ld-modal__dialog--custom-unsupported">
                    <div className="ld-modal__header">
                        <h2 className="ld-modal__title">
                            Custom modal not handled by default ModalOutlet
                        </h2>
                    </div>
                    <div className="ld-modal__body">
                        <p>
                            The current action uses a custom modal configuration.
                            Provide a custom <code>ModalOutlet</code> component via
                            the list&apos;s <code>components</code> configuration to
                            render it.
                        </p>
                    </div>
                    <div className="ld-modal__footer">
                        <button
                            type="button"
                            className="ld-modal__button ld-modal__button--cancel"
                            onClick={onCancel}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Absolute fallback for unknown modal types.
    return null;
};

export default ListModalOutlet;
