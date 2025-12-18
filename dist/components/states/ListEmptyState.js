import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Renders an empty state message for lists with no data.
 *
 * @remarks
 * This component displays a centered message indicating that there is no data
 * to display in the list. It uses a default message if none is provided via props.
 *
 * @param props - The component props
 * @returns A div element containing the empty state message
 *
 * @internal
 */
export const ListEmptyState = ({ message }) => {
    return (_jsx("div", { className: "ld-list-state ld-list-state--empty", children: _jsx("p", { className: "ld-list-state__message", children: message ?? "No data to display." }) }));
};
export default ListEmptyState;
//# sourceMappingURL=ListEmptyState.js.map