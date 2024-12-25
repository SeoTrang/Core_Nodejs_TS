# Core NodeJS TypeScript Project
This project is a Node.js application built with TypeScript. It uses Express for the web server, Knex.js for database migrations and queries, and various other libraries for handling authentication, file uploads, and more.

##### Table of Contents
- Installation
- Configuration
- Scripts
- Project Structure
- Database Migrations
- API Endpoints
- License

##### Installation

1. Clone the repository:
```bash
    git clone <repository-url>
    cd core_nodejs_ts
```
2. Install dependencies:
```bash
    npm install
```

3. Create a .env file in the root directory and add the following environment variables:
```bash
    PORT=10093
    PORT_SOCKET=10094
    ACCESS_TOKEN_SECRET="ACCESS_TOKEN_SECRET"
    REFRESH_TOKEN_SECRET="REFRESH_TOKEN_SECRET"
    DB_NAME="core_nodejs_ts"
    DB_USER_NAME="root"
    DB_USER_PASS=""
    DB_HOST="localhost"
    DB_PORT=3306
    EMAIL_PASS="ckvnixgpidkecgpm"
    EMAIL_USERNAME="maseotrang2020@gmail.com"
    NODE_ENV='local'
```

##### Configuration
The project uses a knexfile.js  for database configuration. Ensure your .env file contains the correct database credentials.

##### Scripts
- Build the project:
```bash
    npm run build
```
- Start the project:
```bash
    npm start
```

- Run the project in development mode:
```bash
    npm run dev
```

- Run database migrations:
```bash
    npx knex migrate:latest --env development
```

- Rollback the last migration:
```bash
    npx knex migrate:rollback --env development
```

##### Project Structure
```bash
    .env
    .gitignore
    knexfile.js
    migrations/
        20241011115840_create_roles_table.js
        20241011115843_create_users_table.js
        20241011115845_create_user_roles_table.js
        20241015153814_otps_table.js
        20241206084237_add_email_to_users_table.js
        20241206090113_add_verifyEmail_to_users_table.js
        20241206093249_update_opts_table.js
    note.txt
    package.json
    readme.md
    src/
        configs/
        constants/
        controllers/
        core/
        db/
        environments/
        global.d.ts
        helpers/
        index.ts
        interfaces/
        middlewares/
        router/
        services/
        utils/
    test_ictu/
        main.js
        tinhdiem.js
    tsconfig.json
```

- migrations: Contains database migration files.
- src: Contains the main source code of the application.
- test_ictu: Contains test-related files.
- tsconfig.json: TypeScript configuration file.
- package.json: Project metadata and dependencies.

##### Database Migrations
To create a new migration:
```bash
    npx knex migrate:make <migration_name> --env development
```

To run all pending migrations:
```bash
    npx knex migrate:latest --env development
```

To rollback the last migration:
```bash
    npx knex migrate:rollback --env development
```

##### API Endpoints
    Authentication
        - Register: POST /api/auth/register
        - Login: POST /api/auth/login
        - Forgot Password: POST /api/auth/forgot-password
        - Send Email: POST /api/auth/send-email
        - Verify Email: POST /api/auth/verify-email
    User Profile
        - Get Profile: GET /api/profile
    File Upload
        - Upload Single File: POST /api/media/file
        - Upload Multiple Files: POST /api/media/files
        - Delete File: DELETE /api/media/file
    Dynamic Endpoints
        - Create Record: POST /api/:router
        - Get Records: GET /api/:router
        - Update Record: PUT /api/:router/:id
        - Delete Record: DELETE /api/:router/:id
        - Soft Delete Record: DELETE /api/:router/destroy/:id

##### API Endpoints
This project is licensed under the MIT License.
    

