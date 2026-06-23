import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';

import { SucursalesController } from './sucursales.controller';
import { SucursalesCoordinator } from './sucursales.coordinator';
import { SucursalesService } from './sucursales.service';

import { SucursalesBO } from './repositories/sucursales.bo';
import { SucursalesRepoAction } from './repositories/sucursales.repoAction';
import { SucursalesRepoData } from './repositories/sucursales.repoData';
import { SucursalesRepoHelper } from './repositories/sucursales.repoHelper';

import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [DatabaseModule, AuthModule],
    controllers: [SucursalesController],
    providers: [
        SucursalesCoordinator,
        SucursalesService,
        SucursalesBO,
        SucursalesRepoAction,
        SucursalesRepoData,
        SucursalesRepoHelper,
    ],
    exports: [SucursalesService],
})
export class SucursalesModule { }