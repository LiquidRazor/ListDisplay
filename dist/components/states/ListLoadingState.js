import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Renders a loading state indicator for lists.
 *
 * @remarks
 * This component displays a spinner animation along with a customizable message
 * to inform users that data is being loaded. The message defaults to "Loading data..."
 * if not provided.
 *
 * @param props - The component props
 * @returns A div element containing a spinner and loading message
 *
 * @internal
 */
export const ListLoadingState = ({ message }) => {
    return (_jsxs("div", { className: "ld-list-state ld-list-state--loading", children: [_jsx("div", { className: "ld-list-state__spinner", "aria-hidden": "true" }), _jsx("p", { className: "ld-list-state__message", children: message ?? "Loading data..." })] }));
};
export default ListLoadingState;
//# sourceMappingURL=ListLoadingState.js.map