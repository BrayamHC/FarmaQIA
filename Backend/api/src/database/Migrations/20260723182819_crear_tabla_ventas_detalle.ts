const tableName = 'ventas_detalle';

exports.up = async function (knex) {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('detalle_id').primary();

        table.uuid('detalle_uuid')
            .notNullable()
            .defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('venta_id').notNullable()
            .references('venta_id').inTable('ventas')
            .onDelete('CASCADE');

        table.integer('producto_id').notNullable()
            .references('producto_id').inTable('productos')
            .onDelete('RESTRICT');

        table.integer('lote_id').nullable()
            .references('lote_id').inTable('lotes')
            .onDelete('RESTRICT');

        table.decimal('cantidad', 14, 4).notNullable().defaultTo(0);
        table.decimal('precio_unitario', 19, 4).notNullable().defaultTo(0);
        table.decimal('descuento', 19, 4).notNullable().defaultTo(0);
        table.decimal('impuesto', 19, 4).notNullable().defaultTo(0);
        table.decimal('subtotal', 19, 4).notNullable().defaultTo(0);
        table.decimal('total', 19, 4).notNullable().defaultTo(0);

        table.string('producto_nombre_snapshot', 255).nullable();
        table.string('sku_snapshot', 100).nullable();

        table.integer('usuario_creacion').nullable();
        table.integer('usuario_actualizacion').nullable();

        table.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').nullable();

        table.unique(['detalle_uuid']);
        table.index(['venta_id']);
        table.index(['producto_id']);
        table.index(['lote_id']);
    });
};

exports.down = async function (knex) {
    return knex.schema.dropTableIfExists(tableName);
};