import {
    MiddlewareConsumer,
    Module,
    NestModule,
    RequestMethod,
} from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseConfig } from './config/database.config';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { ProductosModule } from './modules/productos/productos.module';
import { SucursalesModule } from './modules/sucursales/sucursales.module';
import { ProveedoresModule } from './modules/proveedores/proveedores.module';
import { ClientesModule } from './modules/clientes/clientes.module';
import { AlmacenesModule } from './modules/almacenes/almacenes.module';
import { OrdenesCompraModule } from './modules/ordenesCompra/ordenesCompra.module';
import { CatalogosModule } from './modules/catalogos/catalogos.module';



@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
            envFilePath: '.env',
        }),
        DatabaseModule,
        AuthModule,
        ProductosModule,
        SucursalesModule,
        ProveedoresModule,
        ClientesModule,
        AlmacenesModule,
        OrdenesCompraModule,
        CatalogosModule,
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 60,
            },
        ]),
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: ZodSerializerInterceptor,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .exclude(
                { path: 'auth/login', method: RequestMethod.POST },
                { path: 'docs', method: RequestMethod.GET },
                { path: 'docs-json', method: RequestMethod.GET },
                { path: 'docs/*splat', method: RequestMethod.ALL },
            )
            .forRoutes('*');
    }
}