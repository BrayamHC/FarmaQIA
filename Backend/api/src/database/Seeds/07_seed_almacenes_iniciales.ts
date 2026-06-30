import type { Knex } from 'knex';



export async function seed(knex: Knex): Promise<void> {


    const sucursales = [

        {
            nombre: 'Matriz',
            telefonoBase: '2221234567'
        },

        {
            nombre: 'Sucursal Cholula',
            telefonoBase: '2227654321'
        },

        {
            nombre: 'Sucursal Angelópolis',
            telefonoBase: '2229876543'
        }

    ];




    for (const sucursalData of sucursales) {



        const sucursal =
            await knex('sucursales')
                .where({
                    nombre: sucursalData.nombre
                })
                .first();



        if (!sucursal) {

            throw new Error(
                `No existe la sucursal ${sucursalData.nombre}`
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
                    sucursalData.telefonoBase

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
                    sucursalData.telefonoBase

            }


        ];






        for (const almacen of almacenes) {



            const existe =
                await knex('almacenes')
                    .where({

                        nombre:
                            almacen.nombre,

                        sucursal_id:
                            sucursal.sucursal_id

                    })
                    .first();





            if (existe)
                continue;






            await knex('almacenes')
                .insert({


                    ...almacen,


                    sucursal_id:
                        sucursal.sucursal_id,


                    status:
                        'activo',



                    fecha_creacion:
                        knex.fn.now(),



                    fecha_actualizacion:
                        knex.fn.now()



                });


        }



    }


}