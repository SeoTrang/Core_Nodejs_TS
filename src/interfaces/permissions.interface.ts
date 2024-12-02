
export interface Permissions{
    id: number;
    role_ids: number[]; // [1,2] get from db
    pms : number[]; //[1, 0, 0, 0] <=> [canAccess,canAdd,canEdit,canDelete]
}
