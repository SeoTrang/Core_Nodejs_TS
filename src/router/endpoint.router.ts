import { Router, Request, Response } from 'express';
const router = Router();

import { MainController } from 'src/controllers/main.controller';
// Add a record to any table based on 'table'
router.post('/:table', MainController.create);

// Get all records from any table based on 'table'
router.get('/:table', MainController.get );

// Update a record in any table based on 'table' and 'id'
router.put('/:table/:id',MainController.put );

// Delete a record in any table based on 'table' and 'id'
router.delete('/:table/destroy/:id', MainController.delete);
router.delete('/:table/:id', MainController.setIsDelete);

export default router;
