import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';

import { OrdenesCompraController } from './ordenesCompra.controller';
import { OrdenesCompraCoordinator } from './ordenesCompra.coordinator';
import { OrdenesCompraService } from './ordenesCompra.service';

import { OrdenesCompraBo } from './repositories/ordenesCompra.bo';
import { OrdenesCompraRepoAction } from './repositories/ordenesCompra.repoAction';
import { OrdenesCompraRepoData } from './repositories/ordenesCompra.repoData';
import { OrdenesCompraRepoHelper } from './repositories/ordenesCompra.repoHelper';

import { ProductosModule } from '../productos/productos.module';
import { ProveedoresModule } from '../proveedores/proveedores.module';
import { AlmacenesModule } from '../almacenes/almacenes.module';
import { CatalogosModule } from '../catalogos/catalogos.module';

@Module({
    imports: [
        DatabaseModule,
        ProductosModule,
        ProveedoresModule,
        AlmacenesModule,
        CatalogosModule,
    ],
    controllers: [OrdenesCompraController],
    providers: [
        OrdenesCompraCoordinator,
        OrdenesCompraService,
        OrdenesCompraBo,
        OrdenesCompraRepoAction,
        OrdenesCompraRepoData,
        OrdenesCompraRepoHelper,
    ],
    exports: [OrdenesCompraService],
})
export class OrdenesCompraModule { }