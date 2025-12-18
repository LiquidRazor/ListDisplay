export const createInitialUiState = () => ({
    activeAction: undefined,
    modal: {
        isOpen: false,
    },
});
export const openModalForAction = (prev, actionId, type, rowId) => ({
    ...prev,
    activeAction: {
        type,
        actionId,
        rowId,
    },
    modal: {
        isOpen: true,
        actionId,
        rowId,
    },
});
export const closeModal = (prev) => ({
    ...prev,
    modal: {
        isOpen: false,
    },
});
export const clearActiveAction = (prev) => ({
    ...prev,
    activeAction: undefined,
});
