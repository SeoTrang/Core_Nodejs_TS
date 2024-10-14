// src/services/MainService.ts
import { GetResponse, PostUpdateDeleteResponse } from '@interfaces/response.interface';
import db from '../db/config.db';

export class MainService {
    
    static async createRecord(table: string, data: any): Promise<PostUpdateDeleteResponse> {
        const [id] = await db(table).insert(data);
        return {
            status: 'success',
            data: id,
        };
    }

    static async updateRecord(table: string, id: number, data: any): Promise<PostUpdateDeleteResponse> {
        const affectedRows = await db(table).where({ id }).update(data);
        if (affectedRows) {
            return {
                status: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async softDeleteRecord(table: string, id: number): Promise<PostUpdateDeleteResponse> {
        const affectedRows = await db(table).where({ id }).update({ is_deleted: 1 });
        if (affectedRows) {
            return {
                status: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async deleteRecord(table: string, id: number): Promise<PostUpdateDeleteResponse> {
        const affectedRows = await db(table).where({ id }).del();
        if (affectedRows) {
            return {
                status: 'success',
                data: id,
            };
        }
        throw new Error('Không tìm thấy bản ghi');
    }

    static async getRecords(
        table: string,
        conditions: any[],
        include: string | undefined,
        includeBy: string | undefined,
        order: string | undefined,
        orderBy: string | undefined,
        limit: number,
        page: number
    ): Promise<GetResponse> {
        // console.log('hello world');
        
        const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
        const columnsMap: any = {};
        columnsInfo[0].forEach((column: any) => {
            columnsMap[column.Field] = column.Type;
        });

        let query = db(table).select('*');

        // console.log(query.toSQL());

        if (Array.isArray(conditions)) {
            conditions.forEach((condition: any) => {
                const key = condition.key;
                let value = condition.value;
                const compare = condition.compare || '=';

                const columnType = columnsMap[key];

                if (columnType) {
                    if (columnType.includes('int')) {
                        value = parseInt(value, 10);
                    } else if (columnType.includes('decimal') || columnType.includes('float') || columnType.includes('double')) {
                        value = parseFloat(value);
                    } else if (columnType.includes('date') || columnType.includes('datetime') || columnType.includes('timestamp')) {
                        value = new Date(value);
                    } else if (columnType.includes('varchar') || columnType.includes('text')) {
                        value = value.toString();
                    }

                    if (compare.toLowerCase() === 'like') {
                        const likeValue = value.includes('%') ? value : `%${value}%`;
                        query = query.where(key, 'LIKE', likeValue);
                    } else if (compare.toLowerCase() === 'in') {
                        const values = value.split(',');
                        query = query.whereIn(key, values);
                    } else if (compare.toLowerCase() === 'between') {
                        const values = value.split(',');
                        query = query.whereBetween(key, [values[0], values[1]]);
                    } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                        query = query.where(key, compare, value);
                    }
                }
            });
        }

        if (include && includeBy) {
            const includeValues = include.split(',');
            query = query.whereIn(includeBy, includeValues);
        }

        if (order && orderBy) {
            const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';
            query = query.orderBy(orderBy, sortOrder);
        }

        const [countResult] = await query.clone().count('* as total');
        const totalRecords = parseInt(countResult.total.toString());

        let records;
        
        
        if (limit === -1) {
            records = await query;
        } else {
            const offset = (page - 1) * limit;
            records = await query.limit(limit).offset(offset);
        }

        return {
            status: 'success',
            recordTotal: totalRecords,
            recordFiltered: records.length,
            data: records,
        };
    }
}