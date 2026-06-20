import type { Knex } from 'knex';

const tableName = 'cat_unidades_medida';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('unidad_medida_id').primary();
        table.uuid('unidad_medida_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('clave', 20).notNullable().unique();
        table.string('nombre', 255).notNullable();
        table.string('nombre_corto', 50).nullable();
        table.string('tipo', 150).nullable();

        table.boolean('activo').notNullable().defaultTo(true);

        table.timestamp('fecha_creacion').notNullable().defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').nullable();

        table.index(['clave']);
        table.index(['nombre']);
        table.index(['activo']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}