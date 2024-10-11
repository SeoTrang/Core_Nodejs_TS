/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.string('password').notNullable().defaultTo('$2a$10$hg558qe5yTvC.CjLK9wWpOD8s9e30WqfSovqIYT/MvSdSJ6GNSHmG');
      table.string('refresh_token').nullable();
    });
  };

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('password');
      table.dropColumn('refresh_token');
    });
  };
