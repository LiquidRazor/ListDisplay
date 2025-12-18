import React from "react";
export interface ConfirmModalProps {
    title: string;
    description?: React.ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    onCancel: () => void;
}
/**
 * Very small, unstyled confirm modal.
 * Styling is left to consumer via CSS classes.
 */
export declare const ConfirmModal: React.FC<ConfirmModalProps>;
export default ConfirmModal;
//# sourceMappingURL=ConfirmModal.d.ts.map