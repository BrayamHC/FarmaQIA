import type { Knex } from 'knex';

const tableName = 'ordenes_compra';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('orden_compra_id').primary();
        table.uuid('orden_compra_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('serie_id')
            .unsigned()
            .nullable()
            .references('serie_id')
            .inTable('series')
            .onDelete('RESTRICT');

        table.integer('folio_numero').unsigned().nullable();
        table.string('folio_display', 50).nullable();

        table.integer('sucursal_id')
            .unsigned()
            .notNullable()
            .references('sucursal_id')
            .inTable('sucursales')
            .onDelete('RESTRICT');

        table.integer('almacen_id')
            .unsigned()
            .notNullable()
            .references('almacen_id')
            .inTable('almacenes')
            .onDelete('RESTRICT');

        table.integer('proveedor_id')
            .unsigned()
            .notNullable()
            .references('proveedor_id')
            .inTable('proveedores')
            .onDelete('RESTRICT');

        table.date('fecha_orden').notNullable();
        table.date('fecha_entrega_estimada').nullable();
        table.string('condiciones_pago', 100).nullable();

        table.string('moneda', 3).notNullable().defaultTo('MXN');
        table.decimal('tipo_cambio', 10, 4).notNullable().defaultTo(1);

        table.decimal('subtotal_estimado', 14, 2).notNullable().defaultTo(0);
        table.decimal('iva_estimado', 14, 2).notNullable().defaultTo(0);
        table.decimal('total_estimado', 14, 2).notNullable().defaultTo(0);

        table.string('status', 30).notNullable().defaultTo('borrador')
            .comment('borrador | enviada | autorizada | rechazada | recibida_parcial | recibida | cancelada');

        table.text('notas').nullable();

        table.integer('usuario_autoriza_id').unsigned().nullable();
        table.string('nombre_autoriza', 150).nullable();
        table.timestamp('fecha_autorizacion').nullable();
        table.text('motivo_rechazo').nullable();

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['sucursal_id']);
        table.index(['proveedor_id']);
        table.index(['status']);
        table.index(['fecha_orden']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}