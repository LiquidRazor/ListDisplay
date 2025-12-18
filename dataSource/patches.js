/**
 * Extracts the id from a row based on the configured idKey.
 */
export const getRowId = (row, idKey) => {
    return row[idKey];
};
/**
 * Applies a single data patch to the current list of rows.
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
 */
export const applyPatches = (rows, patches, idKey) => {
    return patches.reduce((current, patch) => applyPatch(current, patch, idKey), rows);
};
