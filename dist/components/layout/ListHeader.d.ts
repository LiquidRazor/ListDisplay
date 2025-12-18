import type { FieldSchema } from "../../types";
export interface ListHeaderProps<TRow = any> {
    fields: Array<FieldSchema<TRow>>;
    hasRowActions: boolean;
}
export declare const ListHeader: <TRow = any>({ fields, hasRowActions, }: ListHeaderProps<TRow>) => any;
export default ListHeader;
//# sourceMappingURL=ListHeader.d.ts.map