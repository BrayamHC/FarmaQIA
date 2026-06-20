import type { Knex } from 'knex';

const tableName = 'lotes';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('lote_id').primary();
        table.uuid('lote_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('codigo_lote', 100).notNullable();
        table.decimal('cantidad_actual', 12, 4).notNullable().defaultTo(0);
        table.date('fecha_fabricacion').nullable();
        table.date('fecha_caducidad').notNullable();
        table.decimal('costo_unitario_compra', 10, 4).notNullable().defaultTo(0);

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | agotado | caducado | eliminado');

        table.integer('almacen_id')
            .unsigned()
            .notNullable()
            .references('almacen_id')
            .inTable('almacenes')
            .onDelete('RESTRICT');

        table.integer('producto_id')
            .unsigned()
            .notNullable()
            .references('producto_id')
            .inTable('productos')
            .onDelete('RESTRICT');

        table.integer('proveedor_id')
            .unsigned()
            .nullable()
            .references('proveedor_id')
            .inTable('proveedores')
            .onDelete('SET NULL');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['producto_id', 'almacen_id']);
        table.index(['fecha_caducidad']);
        table.index(['status']);
        table.index(['codigo_lote']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}