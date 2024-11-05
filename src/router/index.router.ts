import { Express, Router } from 'express';
import endpoint from './endpoint.router';
import auth from './auth.router';
import file from './file.router';
import path from 'path';
import fs from 'fs';
import db from '../db/config.db';

// Tạo router chính
const router = Router();
const modulesDir = path.join(__dirname, 'modules');

// Tạo một mảng để lưu trữ các routes từ thư mục `modules`
const moduleRoutes: string[] = [];

// Hàm để chuyển đổi kiểu dữ liệu dựa trên keyType
const convertDataTypes = (data: any, keyType: any) => {
    const convertedData: any = {};
    for (const key in data) {
        if (keyType.hasOwnProperty(key)) {
            switch (keyType[key]) {
                case 'date':
                    convertedData[key] = new Date(data[key]);
                    break;
                case 'JSON':
                    try {
                        // Kiểm tra nếu data[key] không phải là null và là một chuỗi
                        if (data[key] && typeof data[key] === 'string') {
                            convertedData[key] = JSON.parse(data[key]);
                        } else {
                            convertedData[key] = data[key]; // Giữ nguyên nếu không phải là chuỗi JSON
                        }
                    } catch (e) {
                        console.warn(`Failed to parse JSON for key ${key}:`, e);
                        convertedData[key] = data[key]; // Nếu parse thất bại, giữ nguyên giá trị gốc
                    }
                    break;
                // Thêm các kiểu dữ liệu khác nếu cần
                default:
                    convertedData[key] = data[key];
                    break;
            }
        } else {
            convertedData[key] = data[key]; // Giữ nguyên nếu không có kiểu dữ liệu xác định
        }
    }
    return convertedData;
};

// Middleware chuyển đổi kiểu dữ liệu cho các route
const dataTypeMiddleware = (keyType: any) => {
    return (req: any, res: any, next: any) => {
        // Chuyển đổi dữ liệu cho request body nếu có
        if (req.body) {
            req.body = convertDataTypes(req.body, keyType);
        }
        // Chuyển đổi dữ liệu cho response nếu có
        const originalSend = res.send.bind(res);
        res.send = (body: any) => {
            if (typeof body === 'object') {
                body = convertDataTypes(body, keyType);
            }
            return originalSend(body);
        };
        next();
    };
};


// Đọc tất cả các module trong thư mục `modules` và kiểm tra các route
fs.readdirSync(modulesDir).forEach((file) => {
    const modulePath = path.join(modulesDir, file);

    // Kiểm tra xem module có tồn tại không
    if (fs.existsSync(modulePath)) {
        const mod = require(modulePath);
        console.log('===========================testing module============');

        // Kiểm tra nếu module có phương thức Router
        if (typeof mod.Router === 'function') {
            mod.model = { Knex: db }; // Thiết lập model cho module nếu cần
            const tempRouter = Router(); // Tạo một router tạm thời
            mod.Router(mod.model, tempRouter); // Sử dụng router từ module

            // Lưu trữ các route từ module vào moduleRoutes
            tempRouter.stack.forEach((routeLayer) => {
                if (routeLayer.route) {
                    const routePath = routeLayer.route.path;

                    // Kiểm tra nếu route có chứa từ khóa tương ứng với tên file
                    const moduleKey = path.basename(file, path.extname(file));
                    if (routePath.includes(moduleKey)) {
                        const keyType = mod.keyType; // Lấy keyType từ module
                        // Middleware để chuyển đổi kiểu dữ liệu cho request body và response
                        tempRouter.use(routePath, dataTypeMiddleware(keyType));
                    }

                    if (moduleRoutes.includes(routePath)) {
                        console.warn(`Warning: Route ${routePath} is duplicated in module ${file}`);
                    } else {
                        moduleRoutes.push(routePath);
                        router.use(`/api`, tempRouter); // Đăng ký route từ module vào router chính
                    }
                }
            });
        }
    } else {
        console.warn(`Module ${file} does not exist. Skipping.`);
    }
});

// Đăng ký các route mặc định sau khi kiểm tra
const route = (app: Express): void => {
    console.log(moduleRoutes);
    
    const defaultRoutes = [
        { path: '/api/auth/', handler: auth },
        { path: '/api/file/', handler: file },
        { path: '/api/', handler: endpoint },
    ];

    defaultRoutes.forEach(({ path: routePath, handler }) => {
        // Lấy phần thứ hai trong đường dẫn
        const moduleKey = routePath.split('/')[2]; 
        // Đảm bảo moduleKey là string và kết hợp với modulesDir để tìm module
        const modulePath = path.join(modulesDir, `${moduleKey}.ts`); 

        // Kiểm tra sự tồn tại của module
        if (fs.existsSync(modulePath)) {
            // Sử dụng require để tìm module
            const mod = require(modulePath);

            // Kiểm tra keyType có tồn tại không
            const keyType = mod.keyType;

            if (keyType) {
                router.use(routePath, dataTypeMiddleware(keyType), handler);
            } else {
                router.use(routePath, handler);
            }
        } else {
            console.warn(`Module ${moduleKey}.ts does not exist. Using default handler.`);
            router.use(routePath, handler); // Sử dụng handler mặc định nếu module không tồn tại
        }
    });

    app.use(router);
};

export default route;
