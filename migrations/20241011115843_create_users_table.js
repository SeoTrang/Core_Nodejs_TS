/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', function(table) {
        table.increments('id').primary(); // Tạo cột id tự động tăng
        table.string('name').notNullable(); // Tạo cột name không được null
        table.string('avatar').nullable(); // Tạo cột avatar
        table.string('password').notNullable().defaultTo('$2a$10$hg558qe5yTvC.CjLK9wWpOD8s9e30WqfSovqIYT/MvSdSJ6GNSHmG').comment('default pass: 123'); // Tạo cột avatar
        table.string('refresh_token').nullable(); // Tạo cột avatar
        table.timestamps(true, true); // Tạo cột created_at và updated_at
        table.integer('created_by').defaultTo(0); // Tạo cột created_by
        table.integer('updated_by').defaultTo(0); // Tạo cột updated_by
        table.integer('is_deleted').defaultTo(0); // Tạo cột is_deleted
        table.integer('deleted_by').defaultTo(0); // Tạo cột deleted_by
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users'); // Hủy migration
};
