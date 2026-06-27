import type { Knex } from 'knex';

const tableName = 'productos';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('producto_id').primary();
        table.uuid('producto_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('sku', 20).notNullable();
        table.string('upc', 20).nullable();

        table.string('nombre', 150).notNullable();
        table.text('descripcion').nullable();

        table.integer('unidad_medida_id')
            .unsigned()
            .notNullable()
            .references('unidad_medida_id')
            .inTable('cat_unidades_medida')
            .onDelete('RESTRICT');

        table.integer('categoria_id')
            .unsigned()
            .nullable()
            .references('categoria_id')
            .inTable('cat_categorias_subcategorias')
            .onDelete('SET NULL');

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo | eliminado');

        table.boolean('con_lote').notNullable().defaultTo(false);
        table.text('url_imagen').nullable();
        table.boolean('con_impuestos').notNullable().defaultTo(false);

        table.decimal('precio_publico', 14, 2).notNullable().defaultTo(0);

        table.string('volumen_unidad', 5).nullable();
        table.decimal('volumen_valor', 10, 2).nullable();
        table.string('peso_unidad', 5).nullable();
        table.decimal('peso_valor', 10, 2).nullable();

        table.string('unidad_entrada', 50).notNullable();
        table.string('unidad_salida', 50).notNullable();
        table.string('control_almacen', 50).notNullable()
            .comment('FEFO | PEPS | NINGUNO');

        table.integer('factor_unidades').unsigned().notNullable().defaultTo(1)
            .comment('Relación entre unidad de entrada y salida. Ej: 1 caja = 12 piezas');

        table.decimal('costo_compra', 10, 2).notNullable().defaultTo(0);

        table.string('numero_registro_sanitario', 25).nullable();
        table.jsonb('temperatura').nullable()
            .comment('{ min: number, max: number, unidad: "°C" | "°F" }');

        table.string('presentacion', 50).notNullable();
        table.timestamp('fecha_entrada').nullable();

        table.integer('sucursal_id')
            .unsigned()
            .notNullable()
            .references('sucursal_id')
            .inTable('sucursales')
            .onDelete('RESTRICT');

        table.jsonb('tags').nullable().defaultTo(knex.raw("'[]'::jsonb"));

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['sku']);
        table.index(['upc']);
        table.index(['status']);
        table.index(['categoria_id']);
        table.index(['unidad_medida_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}