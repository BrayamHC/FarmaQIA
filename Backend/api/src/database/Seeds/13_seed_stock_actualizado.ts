import type { Knex } from 'knex';



export async function seed(knex: Knex): Promise<void> {



    const sucursal =
        await knex('sucursales')
            .where({
                nombre: 'Sucursal Cholula'
            })
            .first();



    if (!sucursal)
        throw new Error(
            'No existe sucursal Cholula'
        );




    const almacenes =
        await knex('almacenes')
            .where({
                sucursal_id:
                    sucursal.sucursal_id
            });




    if (!almacenes.length)
        throw new Error(
            'No existen almacenes para sucursal Cholula'
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
            'No existen almacenes configurados para Cholula'
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
            obtenerStockFarmacia(
                producto.sku
            );



        const stockBodega =
            obtenerStockBodega(
                producto.sku
            );





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


        'MED-CH-0001': 45,

        'MED-CH-0002': 30,

        'SUP-CH-0001': 20,

        'HIG-CH-0001': 35,

        'MAT-CH-0001': 50,


    };



    return valores[sku] ?? 10;

}









function obtenerStockBodega(
    sku: string
) {


    const valores: any = {


        'MED-CH-0001': 150,

        'MED-CH-0002': 100,

        'SUP-CH-0001': 80,

        'HIG-CH-0001': 120,

        'MAT-CH-0001': 200,


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
                Math.ceil(
                    cantidad * 0.20
                ),


            stock_maximo:
                cantidad * 3,



            fecha_creacion:
                knex.fn.now(),



            fecha_actualizacion:
                knex.fn.now()


        });


}