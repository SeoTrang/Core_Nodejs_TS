import { BaseEntity } from "./base.interface";
import { Role } from "./role.interface";

export interface User extends BaseEntity{
    id: number;
    name: string;
    avatar?: string;
    password: string;
    refresh_token?: string;
    roles: Role[];
}