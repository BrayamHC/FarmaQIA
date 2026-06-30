import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const sucursalId = 2;


    const productos = [

        {
            sku: 'MED-CH-0001',
            upc: '7500000000209',
            nombre: 'Paracetamol 650 mg tabletas',
            descripcion: 'Analgésico y antipirético dosis reforzada',
            precio_publico: 65,
            presentacion: 'Caja con 24 tabletas',
            con_lote: true,
            categoria_nombre: 'Analgésicos y Antiinflamatorios',
            tags: ['dolor', 'fiebre']
        },


        {
            sku: 'MED-CH-0002',
            upc: '7500000000216',
            nombre: 'Omeprazol 40 mg cápsulas',
            descripcion: 'Protector gástrico alta concentración',
            precio_publico: 90,
            presentacion: 'Caja con 14 cápsulas',
            con_lote: true,
            categoria_nombre: 'Gastrointestinales',
            tags: ['gastritis', 'reflujo']
        },


        {
            sku: 'SUP-CH-0001',
            upc: '7500000000223',
            nombre: 'Vitamina D3 5000 UI',
            descripcion: 'Suplemento vitamínico',
            precio_publico: 180,
            presentacion: 'Frasco con 60 cápsulas',
            con_lote: true,
            categoria_nombre: 'Vitaminas',
            tags: ['vitaminas', 'defensas']
        },


        {
            sku: 'HIG-CH-0001',
            upc: '7500000000230',
            nombre: 'Jabón antibacterial líquido',
            descripcion: 'Higiene personal antibacterial',
            precio_publico: 55,
            presentacion: 'Envase 500 ml',
            con_lote: false,
            categoria_nombre: 'Higiene Corporal',
            tags: ['higiene']
        },


        {
            sku: 'MAT-CH-0001',
            upc: '7500000000247',
            nombre: 'Cubrebocas tricapa desechable',
            descripcion: 'Material médico de protección',
            precio_publico: 40,
            presentacion: 'Caja con 50 piezas',
            con_lote: false,
            categoria_nombre: 'Protección Personal',
            tags: ['proteccion', 'hospital']
        }

    ];



    for (const producto of productos) {


        const categoria = await knex('cat_categorias_subcategorias')
            .where({
                nombre: producto.categoria_nombre
            })
            .first();



        if (!categoria) {
            throw new Error(
                `No existe la categoría '${producto.categoria_nombre}'`
            );
        }



        const existe = await knex('productos')
            .where({
                sku: producto.sku,
                sucursal_id: sucursalId
            })
            .first();



        if (existe) {
            continue;
        }



        await knex('productos')
            .insert({

                sku: producto.sku,

                upc: producto.upc,

                nombre: producto.nombre,

                descripcion: producto.descripcion,


                categoria_id:
                    categoria.categoria_id,


                unidad_medida_id: 1,


                sucursal_id: sucursalId,


                status: 'activo',


                con_lote:
                    producto.con_lote,


                con_impuestos: true,


                precio_publico:
                    producto.precio_publico,


                presentacion:
                    producto.presentacion,


                unidad_entrada: 'Caja',

                unidad_salida: 'Pieza',

                factor_unidades: 1,


                costo_compra:
                    Number(
                        (producto.precio_publico * 0.65)
                            .toFixed(2)
                    ),


                control_almacen:
                    producto.con_lote
                        ? 'FEFO'
                        : 'PEPS',


                tags:
                    JSON.stringify(producto.tags),


                fecha_creacion:
                    knex.fn.now(),


                fecha_actualizacion:
                    knex.fn.now(),

            });

    }

}