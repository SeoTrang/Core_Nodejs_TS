export interface TableSys{
    id: string;
    title: string; // tables name
    isPublic: boolean; // public for all
    // pms : number[]; //[0, 0, 0, 0] <=> [canAccess,canAdd,canEdit,canDelete]

}