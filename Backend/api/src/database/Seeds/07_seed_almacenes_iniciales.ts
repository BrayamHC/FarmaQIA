import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const sucursal = await knex('sucursales')
        .where({
            nombre: 'Matriz'
        })
        .first();


    if (!sucursal) {
        throw new Error(
            'No existe la sucursal Matriz'
        );
    }



    const almacenes = [

        {
            nombre: 'Almacén Farmacia',
            descripcion:
                'Almacén principal de venta al público',

            encargado:
                'Administrador General',

            direccion:
                'Área principal de farmacia',

            telefono:
                '2221234567'
        },


        {
            nombre: 'Almacén Bodega',
            descripcion:
                'Almacén de resguardo y surtido',

            encargado:
                'Encargado de almacén',

            direccion:
                'Bodega interna',

            telefono:
                '2227654321'
        }

    ];



    for (const almacen of almacenes) {


        const existe =
            await knex('almacenes')
                .where({
                    nombre: almacen.nombre,
                    sucursal_id:
                        sucursal.sucursal_id
                })
                .first();



        if (existe)
            continue;



        await knex('almacenes')
            .insert({

                ...almacen,


                status: 'activo',


                sucursal_id:
                    sucursal.sucursal_id,


                fecha_creacion:
                    knex.fn.now(),


                fecha_actualizacion:
                    knex.fn.now()

            });


    }


}