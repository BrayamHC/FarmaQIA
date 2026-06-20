import type { Knex } from 'knex';

const tableName = 'stock_almacen';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('stock_almacen_id').primary();
        table.uuid('stock_almacen_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.decimal('stock_actual', 12, 4).notNullable().defaultTo(0);
        table.decimal('stock_maximo', 12, 4).nullable();
        table.decimal('stock_minimo', 12, 4).nullable().defaultTo(0);

        table.integer('producto_id')
            .unsigned()
            .notNullable()
            .references('producto_id')
            .inTable('productos')
            .onDelete('RESTRICT');

        table.integer('almacen_id')
            .unsigned()
            .notNullable()
            .references('almacen_id')
            .inTable('almacenes')
            .onDelete('RESTRICT');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.unique(['producto_id', 'almacen_id']);
        table.index(['producto_id']);
        table.index(['almacen_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}