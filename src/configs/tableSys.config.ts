import { TableSys } from "@interfaces/tableSys.interface";

export const AccessControl: TableSys[] = [
    {
        id: '1',
        title: 'categorys',
        isPublic: true,
    },
    {
        id: '2',
        title: 'products',
        isPublic: true,
    },
    {
        id: '3',
        title: 'orders',
        isPublic: false,
    }
]


