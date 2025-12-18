import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Renders the root container for list layout structures.
 *
 * @remarks
 * This component provides a wrapper div element that serves as the outermost
 * container for list components. It applies a default "ld-list" class name
 * unless a custom className is provided via props.
 *
 * @param props - The component props
 * @returns A div element wrapping the list content
 *
 * @internal
 */
export const ListContainer = ({ className, children, }) => {
    return (_jsx("div", { className: className ?? "ld-list", children: children }));
};
export default ListContainer;
//# sourceMappingURL=ListContainer.js.map