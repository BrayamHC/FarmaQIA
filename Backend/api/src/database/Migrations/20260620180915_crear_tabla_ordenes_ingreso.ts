import type { Knex } from 'knex';

const tableName = 'ordenes_ingreso';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('orden_ingreso_id').primary();
        table.uuid('orden_ingreso_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

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
            .nullable()
            .references('proveedor_id')
            .inTable('proveedores')
            .onDelete('RESTRICT');

        table.integer('serie_id')
            .unsigned()
            .nullable()
            .references('serie_id')
            .inTable('series')
            .onDelete('RESTRICT');

        table.integer('orden_compra_id')
            .unsigned()
            .nullable()
            .references('orden_compra_id')
            .inTable('ordenes_compra')
            .onDelete('SET NULL')
            .comment('Nullable: permite ingresos sin OC previa');

        // FK real ahora que la tabla existe
        table.integer('factura_orden_ingreso_id')
            .unsigned()
            .nullable()
            .references('factura_orden_ingreso_id')
            .inTable('facturas_orden_ingreso')
            .onDelete('SET NULL')
            .comment('Nullable: ingreso manual sin factura XML');

        table.string('folio_display', 50).nullable();
        table.integer('folio_numero').unsigned().nullable();

        table.date('fecha_recepcion').notNullable();
        table.date('fecha_factura').nullable();
        table.string('condiciones_pago', 100).nullable();

        table.string('moneda', 3).notNullable().defaultTo('MXN');
        table.decimal('tipo_cambio', 10, 4).notNullable().defaultTo(1);

        table.decimal('cantidad_recibida', 12, 4).notNullable().defaultTo(0);
        table.decimal('cantidad_faltante', 12, 4).notNullable().defaultTo(0);

        table.decimal('subtotal', 14, 2).notNullable().defaultTo(0);
        table.decimal('iva', 14, 2).notNullable().defaultTo(0);
        table.decimal('total', 14, 2).notNullable().defaultTo(0);

        table.string('status', 30).notNullable().defaultTo('borrador')
            .comment('borrador | recibida | recibida_parcial | cancelada');

        table.text('notas').nullable();

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['sucursal_id']);
        table.index(['almacen_id']);
        table.index(['proveedor_id']);
        table.index(['orden_compra_id']);
        table.index(['factura_orden_ingreso_id']);
        table.index(['status']);
        table.index(['fecha_recepcion']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}