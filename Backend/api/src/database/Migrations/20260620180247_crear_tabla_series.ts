import type { Knex } from 'knex';

const tableName = 'series';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable(tableName, (table) => {
        table.increments('serie_id').primary();
        table.uuid('serie_uuid').unique().notNullable().defaultTo(knex.raw('gen_random_uuid()'));

        table.integer('tipo_documento_id')
            .unsigned()
            .notNullable()
            .references('tipo_documento_id')
            .inTable('cat_tipos_documentos')
            .onDelete('RESTRICT');

        table.integer('sucursal_id')
            .unsigned()
            .notNullable()
            .references('sucursal_id')
            .inTable('sucursales')
            .onDelete('RESTRICT');

        table.string('serie', 10).notNullable();
        table.string('prefijo', 20).nullable();
        table.integer('folio_inicial').unsigned().notNullable().defaultTo(1);
        table.integer('ultimo_folio').unsigned().notNullable().defaultTo(0);
        table.integer('padding').unsigned().notNullable().defaultTo(6)
            .comment('Cantidad de dígitos con cero a la izquierda, ej: 000001');

        table.boolean('es_default').notNullable().defaultTo(false);
        table.boolean('es_activa').notNullable().defaultTo(true);

        table.integer('usuario_creacion').unsigned().nullable();
        table.integer('usuario_actualizacion').unsigned().nullable();
        table.timestamp('fecha_creacion').defaultTo(knex.fn.now());
        table.timestamp('fecha_actualizacion').defaultTo(knex.fn.now());

        table.unique(['tipo_documento_id', 'sucursal_id', 'serie']);
        table.index(['sucursal_id']);
        table.index(['tipo_documento_id']);
        table.index(['es_default', 'es_activa']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTableIfExists(tableName);
}