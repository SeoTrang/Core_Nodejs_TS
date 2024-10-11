import { Router, Request, Response } from 'express';
import db from '../db/config.db';
import { DtoGetResponse, DtoPostUpdateDeleteResponse } from 'src/models/response.model';



export class MainController{
    
    static async create(req: Request, res: Response){
        try {
            const { table } = req.params; // Get table name from URL
            const data = req.body; // Get data from body
            // console.log(data);
            
            const [id] = await db(table).insert(data); // Insert data into the corresponding table
            const response: DtoPostUpdateDeleteResponse = {
                status:'success',
                data: id // Id của bản ghi vừa thêm
            }
            res.status(201).json(response);
          } catch (error: any) {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: error.message });
          }
    }

    static async put(req: Request, res: Response) {
        try {
          const { table, id } = req.params; // Get table name and id from URL
          const data = req.body; // Get data from body
          const affectedRows = await db(table).where({ id }).update(data); // Update data by ID
          
          if (affectedRows) {
            const response: DtoPostUpdateDeleteResponse = {
                status:'success',
                data: parseInt(id) 
            }
            res.status(200).json(response);
          } else {
            res.status(404).json({ message: 'Không tìm thấy bản ghi' });
          }
        } catch (error: any) {
            console.error('Error updating data:', error);
            res.status(500).json({ error: error.message });
          }
      }

      static async setIsDelete(req: Request, res: Response) {
        try {
          const { table, id } = req.params; // Get table name and id from URL
          const data = {
            is_deleted: 1
          }
          const affectedRows = await db(table).where({ id }).update(data); // Update data by ID
          
          if (affectedRows) {
            const response: DtoPostUpdateDeleteResponse = {
                status:'success',
                data: parseInt(id) 
            }
            res.status(200).json(response);
          } else {
            res.status(404).json({ message: 'Không tìm thấy bản ghi' });
          }
        } catch (error: any) {
          console.error('Error updating data:', error);
          res.status(500).json({ error: error.message });
        }
      }

      static async delete(req: Request, res: Response) {
        try {
          const { table, id } = req.params; // Get table name and id from URL
          const affectedRows = await db(table).where({ id }).del(); // Update data by ID
          
          if (affectedRows) {
            const response: DtoPostUpdateDeleteResponse = {
                status:'success',
                data: parseInt(id) 
            }
            res.status(200).json(response);
          } else {
            res.status(404).json({ message: 'Không tìm thấy bản ghi' });
          }
        } catch (error: any) {
            console.error('Error updating data:', error);
            res.status(500).json({ error: error.message });
          }
      }
      
    static async get(req: Request, res: Response) {
        try {
            const { table } = req.params; // Lấy tên bảng từ URL
    
            // Lấy thông tin về các cột trong bảng
            const columnsInfo = await db.raw(`SHOW COLUMNS FROM ??`, [table]);
    
            // Tạo một map để lưu kiểu dữ liệu của từng cột
            const columnsMap : any = {};
            columnsInfo[0].forEach((column: any) => {
                columnsMap[column.Field] = column.Type;
            });
    
            // Khởi tạo truy vấn cơ bản
            let query = db(table).select('*');
            
    
            // Kiểm tra và áp dụng các điều kiện
            const conditions = req.query.condition;
    
            if (Array.isArray(conditions)) {
                conditions.forEach((condition: any) => {
                    const key = condition.key;
                    let value = condition.value;
                    const compare = condition.compare || '='; // Mặc định là '=' nếu không có
    
                    // Kiểm tra kiểu dữ liệu của cột
                    const columnType = columnsMap[key];
    
                    if (columnType) {
                        // Xử lý kiểu dữ liệu dựa trên kiểu cột
                        if (columnType.includes('int')) {
                            // Ép kiểu về số nguyên
                            value = parseInt(value, 10);
                        } else if (
                            columnType.includes('decimal') ||
                            columnType.includes('float') ||
                            columnType.includes('double')
                        ) {
                            // Ép kiểu về số thập phân
                            value = parseFloat(value);
                        } else if (columnType.includes('date') || columnType.includes('datetime') || columnType.includes('timestamp')) {
                            // Ép kiểu về ngày tháng (date, datetime, timestamp)
                            value = new Date(value);
                        } else if (columnType.includes('time')) {
                            // Nếu kiểu dữ liệu là time, có thể xử lý thêm
                            value = value; // Có thể cần xử lý thêm để phù hợp với định dạng của MySQL nếu cần
                        } else if (columnType.includes('varchar') || columnType.includes('text')) {
                            // Với kiểu dữ liệu chuỗi
                            value = value.toString();
                        }
                        
    
                        // Xử lý toán tử LIKE
                        if (compare.toLowerCase() === 'like') {
                            const likeValue = value.includes('%') ? value : `%${value}%`;
                            query = query.where(key, 'LIKE', likeValue);
                        } else if (compare.toLowerCase() === 'in') {
                            const values = value.split(','); // Chia các giá trị nếu sử dụng IN
                            query = query.whereIn(key, values);
                        } else if (compare.toLowerCase() === 'between') {
                            const values = value.split(','); // Chia các giá trị nếu sử dụng BETWEEN
                            query = query.whereBetween(key, [values[0], values[1]]);
                        } else if (['>', '>=', '<', '<=', '=', '!=', '<>'].includes(compare)) {
                            // Xử lý các toán tử so sánh
                            query = query.where(key, compare, value);
                        } else {
                            console.error(`Unsupported operator: ${compare}`);
                        }
                    } else {
                        console.error(`Column ${key} not found in table ${table}`);
                        throw new Error(`Column ${key} not found in table ${table}`);
                    }
                });
            }
            
            
            // Lấy tổng số bản ghi thỏa mãn điều kiện
            const [countResult] = await query.clone().count('* as total');
            const totalRecords = parseInt(countResult.total.toString());
    
            // Lấy các tham số phân trang từ query
            const limit: number = parseInt(req.query.limit?.toString() ?? '20', 10); // Số bản ghi tối đa trên mỗi trang
            const page: number = parseInt(req.query.page?.toString() ?? '1', 10); // Trang hiện tại
    
            let records;
    
            // Kiểm tra nếu limit = -1 thì lấy tất cả dữ liệu
            if (limit === -1) {
                records = await query; // Lấy tất cả bản ghi
            } else {
                // Tính toán offset cho truy vấn
                const offset = (page - 1) * limit;


    
                
                // Lấy các bản ghi theo giới hạn và phân trang
                records = await query.limit(limit).offset(offset);
                // console.log(query.toSQL());
                
            }
    
            // Tạo đối tượng trả về theo kiểu DtoGetResponse
            const response: DtoGetResponse = {
                status: 'success',
                recordTotal: totalRecords, // Tổng số bản ghi thỏa mãn điều kiện
                recordFiltered: records.length, // Số bản ghi đã lấy
                data: records // Dữ liệu được lấy
            };
    
            res.status(200).json(response); // Trả về dữ liệu
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
            // Trả về dữ liệu theo kiểu DtoGetResponse khi có lỗi
            const response: DtoGetResponse = {
                status: error.message,
                recordTotal: 0,
                recordFiltered: 0,
                data: null
            };
            res.status(500).json(response); // Trả về dữ liệu lỗi
        }
    }
    

}