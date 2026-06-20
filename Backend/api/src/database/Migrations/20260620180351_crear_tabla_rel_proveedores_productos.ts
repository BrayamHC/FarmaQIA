/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

const tableName = 'rel_proveedores_productos'
const foreignKeys = [
    { table: 'productos', id: 'producto_id', delete: 'CASCADE' },
    { table: 'proveedores', id: 'proveedor_id', delete: 'CASCADE' }
];

exports.up = function (knex) {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('rel_proveedores_productos_id').primary();
        foreignKeys.forEach(fk => {
            table.integer(fk.id)
                .unsigned()
                .notNullable()
                .references(fk.id)
                .inTable(fk.table)
                .onDelete(fk.delete);
        });
        // Campos de auditoría
        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists(tableName);
};
