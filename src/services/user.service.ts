import { User } from "@interfaces/user.interface";
import db from "src/db/config.db";


export class UserService{
    static async  findByEmail(email: string): Promise<User>{
        try {
            let user = await db('users').where('email', email).where('is_deleted', 0).first();
            return user;
        } catch (error : any) {
            throw new Error(error);
        }
    }

    static async create(user : Partial<User>): Promise<number>{
        try {
            let result = await db('users').insert(user);
            return result[0];
        } catch (error : any) {
            throw new Error(error);
        }
    }

    static async update(user_id: number,user: Partial<User>): Promise<number> {
        try {
            // Cập nhật thông tin người dùng theo ID
            const result = await db('users')
                .update(user)
                .where('id', user_id);  // Sử dụng 'id' thay vì 'is'
    
            // Trả về số lượng bản ghi đã được cập nhật
            return result;  // result là số lượng bản ghi đã cập nhật (0 nếu không có gì thay đổi)
        } catch (error: any) {
            throw new Error(error);  // Ném lỗi nếu có
        }
    }
    
}