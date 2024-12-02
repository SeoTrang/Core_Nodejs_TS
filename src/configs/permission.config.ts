import { Permissions } from "@interfaces/permissions.interface";

export const  permissions: Permissions[] = [
    {
        id: 1,
        role_ids: [1,2],
        pms: [1, 1,1, 1] // [canAccess, canAdd, canEdit, canDelete]
    }

]