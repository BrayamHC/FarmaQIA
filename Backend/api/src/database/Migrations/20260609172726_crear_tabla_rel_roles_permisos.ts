exports.up = function (knex) {
    return knex.schema.createTable('rel_roles_permisos', (table) => {
        table.increments('rel_roles_permisos_id').primary();
        table.integer('rol_id')
            .unsigned().notNullable()
            .references('rol_id').inTable('cat_roles')
            .onDelete('CASCADE');

        table.integer('permiso_id')
            .unsigned().notNullable()
            .references('permiso_id').inTable('cat_permisos')
            .onDelete('CASCADE');

        table.primary(['rol_id', 'permiso_id']);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('rel_roles_permisos');
};