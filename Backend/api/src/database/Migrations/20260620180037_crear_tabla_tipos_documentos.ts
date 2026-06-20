import type { Knex } from 'knex';

const tableName = 'cat_tipos_documentos';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('tipo_documento_id').primary();
        table.uuid('tipo_documento_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('clave', 20).notNullable().unique();
        table.string('nombre', 100).notNullable();
        table.text('descripcion').nullable();

        table.boolean('es_fiscal').notNullable().defaultTo(false);
        table.boolean('es_configurable').notNullable().defaultTo(false);
        table.boolean('es_sistema').notNullable().defaultTo(false);

        table.string('status', 20).notNullable().defaultTo('activo')
            .comment('activo | inactivo');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['clave']);
        table.index(['status']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}