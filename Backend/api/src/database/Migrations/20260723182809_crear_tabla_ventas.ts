const tableName = 'ventas';

exports.up = async function (knex) {
    await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE status_venta AS ENUM ('cobrada', 'cancelada', 'eliminada');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `);

    return knex.schema.createTable(tableName, (table) => {
        table.increments('venta_id').primary();

        table.uuid('venta_uuid')
            .notNullable()
            .defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('sucursal_id').notNullable()
            .references('sucursal_id').inTable('sucursales')
            .onDelete('RESTRICT');

        table.integer('almacen_id').notNullable()
            .references('almacen_id').inTable('almacenes')
            .onDelete('RESTRICT');

        table.integer('cliente_id').nullable()
            .references('cliente_id').inTable('clientes')
            .onDelete('SET NULL');

        table.integer('usuario_venta_id').notNullable()
            .references('usuario_id').inTable('usuarios')
            .onDelete('RESTRICT');

        table.string('folio', 30).notNullable();

        table.string('metodo_pago', 30).notNullable();

        table.specificType('status', 'status_venta')
            .notNullable()
            .defaultTo('cobrada');

        table.decimal('subtotal', 19, 4).notNullable().defaultTo(0);
        table.decimal('descuento_total', 19, 4).notNullable().defaultTo(0);
        table.decimal('impuesto_total', 19, 4).notNullable().defaultTo(0);
        table.decimal('total', 19, 4).notNullable().defaultTo(0);
        table.decimal('monto_recibido', 19, 4).notNullable().defaultTo(0);
        table.decimal('cambio', 19, 4).notNullable().defaultTo(0);

        table.timestamp('fecha_venta').notNullable().defaultTo(knex.fn.now());
        table.timestamp('fecha_cancelacion').nullable();
        table.timestamp('fecha_eliminacion').nullable();

        table.integer('usuario_creacion').nullable();
        table.integer('usuario_actualizacion').nullable();
        table.integer('usuario_eliminacion').nullable();

        table.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').nullable();

        table.unique(['venta_uuid']);
        table.unique(['folio']);
        table.index(['sucursal_id', 'status']);
        table.index(['almacen_id']);
        table.index(['cliente_id']);
        table.index(['usuario_venta_id']);
        table.index(['fecha_venta']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists(tableName);
    await knex.raw('DROP TYPE IF EXISTS status_venta');
};