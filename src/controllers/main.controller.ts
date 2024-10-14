// src/controllers/MainController.ts
import { Router, Request, Response } from 'express';
import { MainService } from '@services/main.service';

export class MainController {

    static async create(req: Request, res: Response) {
        try {
            const { table } = req.params;
            const data = req.body;
            const response = await MainService.createRecord(table, data);
            res.status(201).json(response);
        } catch (error: any) {
            console.error('Error inserting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async put(req: Request, res: Response) {
        try {
            const { table, id } = req.params;
            const data = req.body;
            const response = await MainService.updateRecord(table, parseInt(id), data);
            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error updating data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async setIsDelete(req: Request, res: Response) {
        try {
            const { table, id } = req.params;
            const response = await MainService.softDeleteRecord(table, parseInt(id));
            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error soft deleting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { table, id } = req.params;
            const response = await MainService.deleteRecord(table, parseInt(id));
            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error deleting data:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async get(req: Request, res: Response) {
        try {
            const { table } = req.params;
            const conditions = req.query.condition ? JSON.parse(JSON.stringify(req.query.condition)) : [];
            // console.log(req.query.condition);
            
            const include = req.query.include?.toString();
            const includeBy = req.query.include_by?.toString();
            const order = req.query.order?.toString();
            const orderBy = req.query.order_by?.toString();
            const limit = parseInt(req.query.limit?.toString() ?? '20', 10);
            const page = parseInt(req.query.page?.toString() ?? '1', 10);

            const response = await MainService.getRecords(
                table,
                conditions,
                include,
                includeBy,
                order,
                orderBy,
                limit,
                page
            );

            res.status(200).json(response);
        } catch (error: any) {
            console.error('Error fetching data:', error.message);
            res.status(500).json({ error: error.message });
        }
    }
}
