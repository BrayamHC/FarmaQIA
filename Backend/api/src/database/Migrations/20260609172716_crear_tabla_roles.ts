/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('cat_roles', (table) => {
        table.uuid('rol_uuid').notNullable().defaultTo(knex.raw('gen_random_uuid()'));
        table.increments('rol_id').primary();
        table.string('descripcion', 100).notNullable();
        table.string('status', 20)
            .notNullable()
            .defaultTo('activo')
            .comment('activo | inactivo | eliminado');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('cat_roles');
};
