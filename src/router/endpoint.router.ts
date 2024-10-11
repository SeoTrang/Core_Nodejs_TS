import { Router, Request, Response } from 'express';
const router = Router();

import db from '../db/config.db';
import { MainController } from 'src/controllers/main.controller';
// Add a record to any table based on 'table'
router.post('/:table', MainController.create);

// Get all records from any table based on 'table'
router.get('/:table', MainController.getLimit );

// Get a record by ID from any table based on 'table' and 'id'
router.get('/:table/:id', async (req: Request, res: Response) => {
  try {
    const { id, table } = req.params; // Get id and table name from URL
    const records = await db(table)
      .select('*') // Select all columns
      .where('id', id); // Filter by id
    res.status(200).json(records);
  } catch (error: any) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a record in any table based on 'table' and 'id'
router.put('/:table/:id', async (req: Request, res: Response) => {
  try {
    const { table, id } = req.params; // Get table name and id from URL
    const data = req.body; // Get data from body
    const affectedRows = await db(table).where({ id }).update(data); // Update data by ID
    if (affectedRows) {
      res.status(200).json({ message: 'Cập nhật thành công!' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Không thể cập nhật dữ liệu' });
  }
});

// Delete a record in any table based on 'table' and 'id'
router.delete('/:table/:id', async (req: Request, res: Response) => {
  try {
    const { table, id } = req.params; // Get table name and id from URL
    const affectedRows = await db(table).where({ id }).del(); // Delete record by ID
    if (affectedRows) {
      res.status(200).json({ message: 'Xóa thành công!' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy bản ghi' });
    }
  } catch (error) {
    console.error('Error deleting data:', error);
    res.status(500).json({ error: 'Không thể xóa dữ liệu' });
  }
});

export default router;
