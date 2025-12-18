import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Renders an error state display for list components.
 *
 * @remarks
 * This component displays an error message when data loading fails.
 * If no custom message is provided, a default error message is shown.
 *
 * @param props - The component props
 * @returns A div element containing the error state display
 *
 * @internal
 */
export const ListErrorState = ({ message }) => {
    return (_jsx("div", { className: "ld-list-state ld-list-state--error", children: _jsx("p", { className: "ld-list-state__message", children: message ?? "An error occurred while loading the data." }) }));
};
export default ListErrorState;
//# sourceMappingURL=ListErrorState.js.map