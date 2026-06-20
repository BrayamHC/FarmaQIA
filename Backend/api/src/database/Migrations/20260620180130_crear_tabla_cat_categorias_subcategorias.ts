import type { Knex } from 'knex';

const tableName = 'cat_categorias_subcategorias';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('categoria_id').primary();
        table.uuid('categoria_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.string('nombre', 150).notNullable();

        table.integer('padre_id')
            .unsigned()
            .nullable()
            .references('categoria_id')
            .inTable(tableName)
            .onDelete('CASCADE');

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.index(['padre_id']);
        table.index(['nombre']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}