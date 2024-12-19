
import { Request, Response, NextFunction } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
    console.error(err);
    res.status(500).json({
      code: 'internal_server_error',
      message: err.message,
      data: null
    });
};

export default errorHandler;
