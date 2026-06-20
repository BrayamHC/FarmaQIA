import type { Knex } from 'knex';

const tableName = 'precios';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('precio_id').primary();
        table.uuid('precio_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.decimal('precio_venta', 14, 2).notNullable();
        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo');
        table.boolean('es_default').notNullable().defaultTo(false);
        table.boolean('con_impuestos').notNullable().defaultTo(false);

        table.integer('producto_id')
            .unsigned()
            .notNullable()
            .references('producto_id')
            .inTable('productos')
            .onDelete('CASCADE');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['producto_id']);
        table.index(['es_default', 'status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}