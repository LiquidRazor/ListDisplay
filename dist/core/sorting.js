const compareValues = (a, b) => {
    if (a == null && b == null)
        return 0;
    if (a == null)
        return 1;
    if (b == null)
        return -1;
    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }
    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }
    const sa = String(a).toLowerCase();
    const sb = String(b).toLowerCase();
    if (sa < sb)
        return -1;
    if (sa > sb)
        return 1;
    return 0;
};
/**
 * Applies sorting to a list of rows.
 */
export const applySorting = (rows, ctx) => {
    const { sort } = ctx;
    if (!sort) {
        return rows;
    }
    const { field, direction } = sort;
    return [...rows].sort((a, b) => {
        const va = a[field];
        const vb = b[field];
        const cmp = compareValues(va, vb);
        return direction === "asc" ? cmp : -cmp;
    });
};
//# sourceMappingURL=sorting.js.map