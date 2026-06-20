import type { Knex } from 'knex';

const tableName = 'partidas_orden_ingreso';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('partida_orden_ingreso_id').primary();
        table.uuid('partida_orden_ingreso_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('numero_orden_ingreso').unsigned().nullable()
            .comment('Número de línea dentro de la orden');

        table.integer('orden_ingreso_id')
            .unsigned()
            .notNullable()
            .references('orden_ingreso_id')
            .inTable('ordenes_ingreso')
            .onDelete('CASCADE');

        table.integer('partida_oc_id')
            .unsigned()
            .nullable()
            .references('partida_oc_id')
            .inTable('partidas_oc')
            .onDelete('SET NULL');

        // concepto_factura_id para cuando llegue XML, sin FK por ahora
        table.integer('concepto_factura_id').unsigned().nullable();

        table.integer('lote_id')
            .unsigned()
            .nullable()
            .references('lote_id')
            .inTable('lotes')
            .onDelete('RESTRICT');

        table.integer('producto_id')
            .unsigned()
            .notNullable()
            .references('producto_id')
            .inTable('productos')
            .onDelete('RESTRICT');

        table.decimal('cantidad_recibida', 12, 4).notNullable();
        table.decimal('cantidad_faltante', 12, 4).notNullable().defaultTo(0);
        table.decimal('precio_unitario_real', 10, 4).notNullable().defaultTo(0);
        table.decimal('descuento_porcentaje', 5, 2).notNullable().defaultTo(0);
        table.decimal('descuento_importe', 10, 2).notNullable().defaultTo(0);
        table.decimal('subtotal', 14, 2).notNullable().defaultTo(0);
        table.decimal('iva_tasa', 5, 2).notNullable().defaultTo(0);
        table.decimal('iva_importe', 14, 2).notNullable().defaultTo(0);
        table.decimal('total', 14, 2).notNullable().defaultTo(0);

        table.string('no_identificacion', 100).nullable()
            .comment('Número de identificación del concepto en la factura XML');

        table.string('status', 20).notNullable().defaultTo('recibida')
            .comment('recibida | faltante | devuelta | cancelada');

        table.text('comentarios').nullable();

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['orden_ingreso_id']);
        table.index(['producto_id']);
        table.index(['lote_id']);
        table.index(['partida_oc_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}