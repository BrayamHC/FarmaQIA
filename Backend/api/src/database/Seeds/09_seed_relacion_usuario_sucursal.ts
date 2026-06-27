import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const usuario = await knex('usuarios')
        .where({
            usuario_id: 1
        })
        .first();


    if (!usuario) {
        throw new Error(
            'No existe el usuario con usuario_id 1'
        );
    }



    const sucursales = await knex('sucursales')
        .whereIn(
            'sucursal_id',
            [
                1,
                2,
                3
            ]
        )
        .select();



    if (sucursales.length !== 3) {

        throw new Error(
            'No existen las 3 sucursales requeridas (1,2,3)'
        );

    }



    for (const sucursal of sucursales) {


        const existe =
            await knex('rel_sucursales_usuarios')
                .where({

                    usuario_id:
                        usuario.usuario_id,


                    sucursal_id:
                        sucursal.sucursal_id

                })
                .first();



        if (existe) {
            continue;
        }



        await knex('rel_sucursales_usuarios')
            .insert({

                usuario_id:
                    usuario.usuario_id,


                sucursal_id:
                    sucursal.sucursal_id

            });

    }

}