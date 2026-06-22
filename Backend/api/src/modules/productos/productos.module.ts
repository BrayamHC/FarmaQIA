import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';

import { ProductosController } from './productos.controller';
import { ProductosCoordinator } from './productos.coordinator';
import { ProductosService } from './productos.service';
import { ProductosBO } from './repositories/productos.bo';
import { ProductosRepoAction } from './repositories/productos.repoAction';
import { ProductosRepoData } from './repositories/productos.repoData';
import { ProductosRepoHelper } from './repositories/productos.repoHelper';

@Module({
    imports: [DatabaseModule],
    controllers: [ProductosController],
    providers: [
        ProductosCoordinator,
        ProductosService,
        ProductosBO,
        ProductosRepoAction,
        ProductosRepoData,
        ProductosRepoHelper,
    ],
    exports: [ProductosService],
})
export class ProductosModule { }