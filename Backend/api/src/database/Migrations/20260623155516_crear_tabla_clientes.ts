const tableName = 'clientes';

exports.up = async function (knex) {
    await knex.raw(`
        DO $$ BEGIN
            CREATE TYPE status_cliente AS ENUM (
                'activo',
                'inactivo',
                'eliminado'
            );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
    `);

    return knex.schema.createTable(tableName, (table) => {
        table.increments('cliente_id').primary();

        table.uuid('cliente_uuid')
            .notNullable()
            .defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('sucursal_id').notNullable()
            .references('sucursal_id').inTable('sucursales')
            .onDelete('RESTRICT');

        table.string('nombre', 255).notNullable();
        table.string('telefono', 30).nullable();
        table.string('email', 255).nullable();
        table.text('direccion').nullable();

        table.string('rfc', 20).nullable();
        table.string('razon_social', 255).nullable();

        table.string('codigo_postal_fiscal', 10).nullable();

        table.specificType('status', 'status_cliente')
            .notNullable()
            .defaultTo('activo');

        table.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').nullable();
        table.timestamp('fecha_eliminacion').nullable();

        table.integer('usuario_creacion').nullable();
        table.integer('usuario_actualizacion').nullable();

        table.unique(['cliente_uuid']);
        table.index(['sucursal_id', 'status']);
        table.index(['rfc']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists(tableName);
    await knex.raw('DROP TYPE IF EXISTS status_cliente');
};