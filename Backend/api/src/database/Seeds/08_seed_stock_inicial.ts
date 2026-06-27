import type { Knex } from 'knex';



export async function seed(knex: Knex): Promise<void> {



    const sucursal =
        await knex('sucursales')
            .where({
                nombre: 'Matriz'
            })
            .first();



    if (!sucursal)
        throw new Error(
            'No existe sucursal Matriz'
        );



    const almacenes =
        await knex('almacenes')
            .where({
                sucursal_id:
                    sucursal.sucursal_id
            });



    if (!almacenes.length)
        throw new Error(
            'No existen almacenes'
        );



    const almacenFarmacia =
        almacenes.find(
            x =>
                x.nombre === 'Almacén Farmacia'
        );



    const almacenBodega =
        almacenes.find(
            x =>
                x.nombre === 'Almacén Bodega'
        );



    if (!almacenFarmacia || !almacenBodega)
        throw new Error(
            'No existen almacenes configurados'
        );




    const productos =
        await knex('productos')
            .where({
                sucursal_id:
                    sucursal.sucursal_id
            })
            .select([
                'producto_id',
                'sku',
                'nombre'
            ]);




    for (const producto of productos) {



        const stockFarmacia =
            obtenerStockFarmacia(producto.sku);



        const stockBodega =
            obtenerStockBodega(producto.sku);



        await insertarStock(
            knex,
            producto.producto_id,
            almacenFarmacia.almacen_id,
            stockFarmacia
        );



        await insertarStock(
            knex,
            producto.producto_id,
            almacenBodega.almacen_id,
            stockBodega
        );

    }


}




function obtenerStockFarmacia(
    sku: string
) {


    const valores: any = {


        'MED-0001': 50,
        'MED-0002': 35,
        'MED-0003': 40,
        'MED-0004': 20,
        'SUP-0001': 25,
        'HIG-0001': 30,
        'MAT-0001': 15,
        'BEB-0001': 20

    };


    return valores[sku] ?? 10;

}




function obtenerStockBodega(
    sku: string
) {


    const valores: any = {


        'MED-0001': 200,
        'MED-0002': 150,
        'MED-0003': 120,
        'MED-0004': 80,
        'SUP-0001': 100,
        'HIG-0001': 120,
        'MAT-0001': 90,
        'BEB-0001': 70

    };


    return valores[sku] ?? 50;

}





async function insertarStock(
    knex: Knex,
    producto_id: number,
    almacen_id: number,
    cantidad: number
) {



    const existe =
        await knex('stock_almacen')
            .where({

                producto_id,

                almacen_id

            })
            .first();



    if (existe)
        return;



    await knex('stock_almacen')
        .insert({

            producto_id,


            almacen_id,


            stock_actual:
                cantidad,


            stock_minimo:
                Math.ceil(cantidad * 0.20),


            stock_maximo:
                cantidad * 3,


            fecha_creacion:
                knex.fn.now(),


            fecha_actualizacion:
                knex.fn.now()

        });


}