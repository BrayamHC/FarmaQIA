import type { Knex } from 'knex';


export async function seed(knex: Knex): Promise<void> {


    const sucursal = await knex('sucursales')
        .where({
            nombre: 'Matriz'
        })
        .first();


    if (!sucursal)
        throw new Error('No existe sucursal Matriz');



    const pieza = await knex('cat_unidades_medida')
        .where({
            clave: 'H87'
        })
        .first();



    const obtenerCategoria = async (nombre: string) => {

        const cat = await knex('cat_categorias_subcategorias')
            .where({
                nombre
            })
            .first();

        return cat?.categoria_id ?? null;

    };



    const productos = [

        {
            sku: 'MED-0001',
            upc: '7500000000018',
            nombre: 'Paracetamol 500 mg tabletas',
            descripcion: 'Analgésico y antipirético',
            categoria: 'Analgésicos y Antiinflamatorios',
            precio_publico: 45,
            presentacion: 'Caja con 20 tabletas',
            con_lote: true,
            registro: 'SSA-001',
            url_imagen: 'https://www.movil.farmaciasguadalajara.com/wcsstore/FGCAS/wcs/products/871664_A_1280_AL.jpg',
            tags: ['dolor', 'fiebre', 'cabeza', 'muscular']
        },


        {
            sku: 'MED-0002',
            upc: '7500000000025',
            nombre: 'Ibuprofeno 400 mg tabletas',
            descripcion: 'Antiinflamatorio y analgésico',
            categoria: 'Analgésicos y Antiinflamatorios',
            precio_publico: 75,
            presentacion: 'Caja con 10 tabletas',
            con_lote: true,
            registro: 'SSA-002',
            url_imagen: 'https://www.fahorro.com/media/catalog/product/7/5/7503006569623.png',
            tags: ['dolor', 'inflamacion', 'huesos', 'muscular', 'articulaciones']
        },


        {
            sku: 'MED-0003',
            upc: '7500000000032',
            nombre: 'Omeprazol 20 mg cápsulas',
            descripcion: 'Protector gástrico',
            categoria: 'Medicamentos',
            precio_publico: 60,
            presentacion: 'Caja con 14 cápsulas',
            con_lote: true,
            registro: 'SSA-003',
            url_imagen: 'https://arteli.vtexassets.com/arquivos/ids/258438/7502216792760_00.jpg',
            tags: ['estomago', 'gastritis', 'acidez', 'agruras', 'reflujo']
        },


        {
            sku: 'MED-0004',
            upc: '7500000000049',
            nombre: 'Amoxicilina 500 mg cápsulas',
            descripcion: 'Antibiótico',
            categoria: 'Antibióticos',
            precio_publico: 120,
            presentacion: 'Caja con 12 cápsulas',
            con_lote: true,
            registro: 'SSA-004',
            url_imagen: 'https://farmaciasanjorge.com/cdn/shop/products/7501349021570.jpg',
            tags: ['infeccion', 'antibiotico', 'garganta', 'respiratorio']
        },


        {
            sku: 'SUP-0001',
            upc: '7500000000056',
            nombre: 'Vitamina C 1g efervescente',
            descripcion: 'Suplemento alimenticio',
            categoria: 'Vitaminas y Suplementos',
            precio_publico: 95,
            presentacion: 'Tubo con 10 tabletas',
            con_lote: true,
            url_imagen: 'https://farmaciassimilaresmx.vtexassets.com/arquivos/ids/157620/632.png',
            tags: ['gripa', 'resfriado', 'defensas', 'vitaminas']
        },


        {
            sku: 'HIG-0001',
            upc: '7500000000063',
            nombre: 'Alcohol etílico 70%',
            descripcion: 'Antiséptico',
            categoria: 'Higiene Personal',
            precio_publico: 35,
            presentacion: 'Botella 500 ml',
            con_lote: true,
            url_imagen: 'https://resources.claroshop.com/imagenes-sanborns-ii/1200/7503014279248.jpg',
            tags: ['heridas', 'antiseptico', 'limpieza', 'curacion']
        },


        {
            sku: 'MAT-0001',
            upc: '7500000000070',
            nombre: 'Gasas estériles 10x10 cm',
            descripcion: 'Material médico',
            categoria: 'Material Médico',
            precio_publico: 25,
            presentacion: 'Paquete 10 piezas',
            con_lote: true,
            url_imagen: 'https://curitek.com/wp-content/uploads/2024/12/GASA-ESTERIL-10-X-10-CM-CAJA-CON-100-PZ.jpg',
            tags: ['heridas', 'curacion', 'material medico']
        },


        {
            sku: 'BEB-0001',
            upc: '7500000000087',
            nombre: 'Suero oral sabor naranja',
            descripcion: 'Solución hidratante',
            categoria: 'Alimentos y Bebidas',
            precio_publico: 22,
            presentacion: 'Botella 1 litro',
            con_lote: true,
            url_imagen: 'https://i5-mx.walmartimages.com/mg/gm/1p/images/product-images/img_large/00750127707833l.jpg',
            tags: ['diarrea', 'deshidratacion', 'hidratacion']
        },


        {
            sku: 'GRI-0001',
            upc: '7500000000094',
            nombre: 'Antigripal tabletas',
            descripcion: 'Alivio de síntomas de gripe',
            categoria: 'Medicamentos',
            precio_publico: 65,
            presentacion: 'Caja con 10 tabletas',
            con_lote: true,
            url_imagen: 'https://www.fahorro.com/media/catalog/product/a/n/antigripal.jpg',
            tags: ['gripa', 'tos', 'resfriado', 'congestion']
        },


        {
            sku: 'TOS-0001',
            upc: '7500000000100',
            nombre: 'Ambroxol jarabe 120 ml',
            descripcion: 'Expectorante mucolítico',
            categoria: 'Medicamentos',
            precio_publico: 70,
            presentacion: 'Frasco 120 ml',
            con_lote: true,
            url_imagen: 'https://www.farmaciasanpablo.com.mx/media/catalog/product/a/m/ambroxol.jpg',
            tags: ['tos', 'flemas', 'bronquios']
        },


        {
            sku: 'GAS-0001',
            upc: '7500000000117',
            nombre: 'Antiácido suspensión',
            descripcion: 'Auxiliar contra acidez estomacal',
            categoria: 'Medicamentos',
            precio_publico: 55,
            presentacion: 'Frasco 360 ml',
            con_lote: true,
            url_imagen: 'https://www.fahorro.com/media/catalog/product/a/n/antiacido.jpg',
            tags: ['estomago', 'acidez', 'agruras']
        },


        {
            sku: 'DIA-0001',
            upc: '7500000000124',
            nombre: 'Loperamida 2 mg cápsulas',
            descripcion: 'Auxiliar contra diarrea',
            categoria: 'Medicamentos',
            precio_publico: 40,
            presentacion: 'Caja 12 cápsulas',
            con_lote: true,
            url_imagen: 'https://www.farmaciasguadalajara.com/loperamida.jpg',
            tags: ['diarrea', 'estomago']
        },


        {
            sku: 'ALR-0001',
            upc: '7500000000131',
            nombre: 'Loratadina 10 mg tabletas',
            descripcion: 'Antihistamínico para alergias',
            categoria: 'Medicamentos',
            precio_publico: 55,
            presentacion: 'Caja 10 tabletas',
            con_lote: true,
            url_imagen: 'https://www.fahorro.com/media/catalog/product/l/o/loratadina.jpg',
            tags: ['alergia', 'estornudos', 'comezon']
        },


        {
            sku: 'DER-0001',
            upc: '7500000000148',
            nombre: 'Crema antimicótica clotrimazol',
            descripcion: 'Tratamiento tópico antimicótico',
            categoria: 'Dermatología',
            precio_publico: 80,
            presentacion: 'Tubo 30 g',
            con_lote: true,
            url_imagen: 'https://www.farmaciasanpablo.com.mx/clotrimazol.jpg',
            tags: ['piel', 'hongos', 'comezon']
        },


        {
            sku: 'OFT-0001',
            upc: '7500000000155',
            nombre: 'Gotas lubricantes oftálmicas',
            descripcion: 'Lágrimas artificiales',
            categoria: 'Oftalmológicos',
            precio_publico: 95,
            presentacion: 'Frasco 15 ml',
            con_lote: true,
            url_imagen: 'https://www.fahorro.com/media/catalog/product/g/o/gotas.jpg',
            tags: ['ojos', 'resequedad', 'irritacion']
        },


        {
            sku: 'VIT-0002',
            upc: '7500000000162',
            nombre: 'Multivitamínico adulto',
            descripcion: 'Complejo vitamínico',
            categoria: 'Vitaminas y Suplementos',
            precio_publico: 150,
            presentacion: 'Frasco 30 tabletas',
            con_lote: true,
            url_imagen: 'https://www.farmaciasimilares.com/multivitaminico.jpg',
            tags: ['vitaminas', 'energia', 'defensas']
        },


        {
            sku: 'MAT-0002',
            upc: '7500000000179',
            nombre: 'Vendas elásticas 10 cm',
            descripcion: 'Material de curación',
            categoria: 'Material Médico',
            precio_publico: 30,
            presentacion: 'Pieza',
            con_lote: true,
            url_imagen: 'https://curitek.com/venda-elastica.jpg',
            tags: ['heridas', 'vendaje', 'curacion']
        },


        {
            sku: 'HIG-0002',
            upc: '7500000000186',
            nombre: 'Gel antibacterial 500 ml',
            descripcion: 'Higiene de manos',
            categoria: 'Higiene Personal',
            precio_publico: 60,
            presentacion: 'Botella 500 ml',
            con_lote: true,
            url_imagen: 'https://www.walmart.com.mx/gel-antibacterial.jpg',
            tags: ['higiene', 'manos', 'antiseptico']
        },


        {
            sku: 'BEB-0002',
            upc: '7500000000193',
            nombre: 'Agua mineral 600 ml',
            descripcion: 'Bebida hidratante',
            categoria: 'Alimentos y Bebidas',
            precio_publico: 18,
            presentacion: 'Botella 600 ml',
            con_lote: true,
            url_imagen: 'https://www.walmart.com.mx/agua.jpg',
            tags: ['bebida', 'hidratacion']
        }

    ];



    for (const producto of productos) {


        const existe = await knex('productos')
            .where({
                sku: producto.sku
            })
            .first();


        if (existe)
            continue;



        const categoria_id =
            await obtenerCategoria(producto.categoria);



        await knex('productos')
            .insert({

                sku: producto.sku,

                upc: producto.upc,


                nombre: producto.nombre,


                descripcion:
                    producto.descripcion,



                unidad_medida_id:
                    pieza.unidad_medida_id,



                categoria_id,



                status:
                    'activo',



                con_lote:
                    producto.con_lote,



                url_imagen:
                    producto.url_imagen ?? null,



                con_impuestos:
                    true,



                precio_publico:
                    producto.precio_publico,



                unidad_entrada:
                    producto.presentacion.includes('Frasco') ||
                        producto.presentacion.includes('Botella')
                        ? 'Pieza'
                        : 'Caja',



                unidad_salida:
                    'Pieza',



                factor_unidades:
                    1,



                costo_compra:
                    Number(
                        (producto.precio_publico * 0.65)
                            .toFixed(2)
                    ),



                numero_registro_sanitario:
                    producto.registro ?? null,



                presentacion:
                    producto.presentacion,



                sucursal_id:
                    sucursal.sucursal_id,



                tags:
                    JSON.stringify(producto.tags ?? []),



                control_almacen:
                    producto.con_lote
                        ? 'FEFO'
                        : 'PEPS',



                fecha_creacion:
                    knex.fn.now(),



                fecha_actualizacion:
                    knex.fn.now()

            });


    }


}