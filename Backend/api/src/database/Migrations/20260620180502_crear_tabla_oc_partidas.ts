import type { Knex } from 'knex';

const tableName = 'partidas_oc';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('partida_oc_id').primary();
        table.uuid('partida_oc_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('orden_compra_id')
            .unsigned()
            .notNullable()
            .references('orden_compra_id')
            .inTable('ordenes_compra')
            .onDelete('CASCADE');

        table.integer('producto_id')
            .unsigned()
            .notNullable()
            .references('producto_id')
            .inTable('productos')
            .onDelete('RESTRICT');

        table.decimal('cantidad_solicitada', 12, 4).notNullable();
        table.decimal('precio_unitario_est', 10, 4).notNullable().defaultTo(0);
        table.decimal('descuento_porcentaje', 5, 2).notNullable().defaultTo(0);
        table.decimal('descuento_importe', 10, 2).notNullable().defaultTo(0);
        table.decimal('subtotal_estimado', 14, 2).notNullable().defaultTo(0);
        table.decimal('cantidad_recibida', 12, 4).notNullable().defaultTo(0);

        table.string('status', 20).notNullable().defaultTo('pendiente')
            .comment('pendiente | recibida_parcial | recibida | cancelada');

        table.text('comentarios').nullable();

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['orden_compra_id']);
        table.index(['producto_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}