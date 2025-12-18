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
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="ld-modal ld-modal--backdrop">
      <div className="ld-modal__dialog ld-modal__dialog--confirm">
        <div className="ld-modal__header">
          <h2 className="ld-modal__title">{title}</h2>
        </div>

        {description && (
          <div className="ld-modal__body">
            {typeof description === "string" ? (
              <p>{description}</p>
            ) : (
              description
            )}
          </div>
        )}

        <div className="ld-modal__footer">
          <button
            type="button"
            className="ld-modal__button ld-modal__button--cancel"
            onClick={handleCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="ld-modal__button ld-modal__button--confirm"
            onClick={handleConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
