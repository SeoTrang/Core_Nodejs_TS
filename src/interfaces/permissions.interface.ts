
export interface Permissions{
    id: number;
    role_id: number; 
    pms : number[]; //[1, 0, 0, 0] <=> [canAccess,canAdd,canEdit,canDelete]
    table_id: number;
}
