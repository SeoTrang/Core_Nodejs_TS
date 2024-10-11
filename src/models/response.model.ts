export type DtoGetResponse = {
    status: string;
    recordTotal: number;
    recordFiltered: number;
    data: any;
}

export type DtoPostUpdateDeleteResponse = {
    status: string;
    data: number;
}