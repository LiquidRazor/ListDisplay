import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// src/components/modals/ListModalOutlet.tsx
import { useMemo } from "react";
import { ConfirmModal } from "./ConfirmModal.tsx";
/**
 * Default modal outlet implementation.
 *
 * Supports:
 *  - Confirm modal (ModalConfig.type === "confirm")
 *
 * For custom modals (ModalConfig.type === "custom"), consumers are expected
 * to override this component via the "ModalOutlet" slot and handle rendering
 * themselves.
 */
export const ListModalOutlet = ({ state, generalActions, rowActions, onConfirm, onCancel, }) => {
    const { ui } = state;
    const { modal, activeAction } = ui;
    if (!modal || !modal.isOpen || !modal.actionId) {
        return null;
    }
    const actionType = activeAction?.type
        ?? (modal.rowId != null ? "row" : "general");
    const { action, modalConfig } = useMemo(() => {
        let act;
        let config;
        if (actionType === "general") {
            act = (generalActions ?? []).find((a) => a.id === modal.actionId);
        }
        else if (actionType === "row") {
            act = (rowActions ?? []).find((a) => a.id === modal.actionId);
        }
        if (act && act.modal) {
            config = act.modal;
        }
        return { action: act, modalConfig: config };
    }, [actionType, modal.actionId, generalActions, rowActions]);
    // Dacă nu găsim acțiunea sau nu are modal config, tot afișăm ceva minim.
    if (!action || !modalConfig) {
        return (_jsx(ConfirmModal, { title: "Confirm action", description: _jsx("span", { children: "Are you sure you want to execute this action?" }), onConfirm: () => onConfirm(), onCancel: onCancel }));
    }
    // Confirm modal config suportat fully aici.
    if (modalConfig.type === "confirm") {
        return (_jsx(ConfirmModal, { title: modalConfig.title, description: modalConfig.description, confirmLabel: modalConfig.confirmLabel, cancelLabel: modalConfig.cancelLabel, onConfirm: () => onConfirm(), onCancel: onCancel }));
    }
    // Custom modal NU este implementat by default în core.
    // Utilizatorul poate overrida ModalOutlet în config.components.ModalOutlet.
    if (modalConfig.type === "custom") {
        return (_jsx("div", { className: "ld-modal ld-modal--backdrop", children: _jsxs("div", { className: "ld-modal__dialog ld-modal__dialog--custom-unsupported", children: [_jsx("div", { className: "ld-modal__header", children: _jsx("h2", { className: "ld-modal__title", children: "Custom modal not handled by default ModalOutlet" }) }), _jsx("div", { className: "ld-modal__body", children: _jsxs("p", { children: ["The current action uses a custom modal configuration. Provide a custom ", _jsx("code", { children: "ModalOutlet" }), " component via the list's ", _jsx("code", { children: "components" }), " configuration to render it."] }) }), _jsx("div", { className: "ld-modal__footer", children: _jsx("button", { type: "button", className: "ld-modal__button ld-modal__button--cancel", onClick: onCancel, children: "Close" }) })] }) }));
    }
    // fallback absolut (în caz de tip necunoscut)
    return null;
};
export default ListModalOutlet;
