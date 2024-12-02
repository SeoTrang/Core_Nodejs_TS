export type GetResponse = {
    status: string;
    recordTotal: number;
    recordFiltered: number;
    data: any;
}

export type PostUpdateDeleteResponse = {
    status: string;
    data: number;
}