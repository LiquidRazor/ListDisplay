/**
 * Extracts the id from a row based on the configured idKey.
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param row - The row object from which to extract the id
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns The extracted row identifier of type TRowId
 *
 * @internal
 */
export const getRowId = (row, idKey) => {
    return row[idKey];
};
/**
 * Applies a single data patch to the current list of rows.
 *
 * @remarks
 * Supports multiple patch types:
 * - `replaceAll`: Replaces the entire rows array with new rows
 * - `append`: Adds a single row to the end of the array
 * - `update`: Updates an existing row by matching its id
 * - `remove`: Removes a row by matching its id
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param rows - The current array of rows to apply the patch to
 * @param patch - The data patch operation to apply
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns A new array of rows with the patch applied
 *
 * @internal
 */
export const applyPatch = (rows, patch, idKey) => {
    switch (patch.type) {
        case "replaceAll":
            return [...patch.rows];
        case "append":
            return [...rows, patch.row];
        case "update": {
            const targetId = getRowId(patch.row, idKey);
            let changed = false;
            const next = rows.map((row) => {
                const rowId = getRowId(row, idKey);
                if (rowId === targetId) {
                    changed = true;
                    return patch.row;
                }
                return row;
            });
            return changed ? next : next;
        }
        case "remove": {
            let changed = false;
            const next = rows.filter((row) => {
                const rowId = getRowId(row, idKey);
                if (rowId === patch.id) {
                    changed = true;
                    return false;
                }
                return true;
            });
            return changed ? next : next;
        }
        default:
            return rows;
    }
};
/**
 * Applies a list of patches in order.
 *
 * @remarks
 * Sequentially reduces over the patches array, applying each patch to the result of the previous patch.
 *
 * @typeParam TRow - The type of the row object
 * @typeParam TRowId - The type of the row identifier, must extend RowId
 *
 * @param rows - The initial array of rows to apply the patches to
 * @param patches - An array of data patch operations to apply in order
 * @param idKey - The property key on the row object that contains the id
 *
 * @returns A new array of rows with all patches applied
 *
 * @internal
 */
export const applyPatches = (rows, patches, idKey) => {
    return patches.reduce((current, patch) => applyPatch(current, patch, idKey), rows);
};
//# sourceMappingURL=patches.js.map