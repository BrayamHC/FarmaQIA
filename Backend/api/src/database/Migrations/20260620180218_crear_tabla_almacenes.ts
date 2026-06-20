import type { Knex } from 'knex';

const tableName = 'almacenes';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('almacen_id').primary();
        table.uuid('almacen_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('nombre', 150).notNullable();
        table.text('descripcion').nullable();
        table.string('encargado', 150).nullable();
        table.text('direccion').nullable();
        table.string('telefono', 20).nullable();

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo | eliminado');

        table.integer('sucursal_id')
            .unsigned()
            .notNullable()
            .references('sucursal_id')
            .inTable('sucursales')
            .onDelete('RESTRICT');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['sucursal_id']);
        table.index(['status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}