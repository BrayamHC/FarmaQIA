import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';
import { ProveedoresRepoData } from './repositories/proveedores.repoData';
import { ProveedoresRepoAction } from './repositories/proveedores.repoAction';
import { ProveedorBO } from './repositories/proveedores.bo';
import { ProveedoresRepoHelper } from './repositories/proveedores.repoHelper';

@Module({
    imports: [DatabaseModule],
    controllers: [ProveedoresController],
    providers: [
        ProveedoresService,
        ProveedoresRepoData,
        ProveedoresRepoAction,
        ProveedorBO,
        ProveedoresRepoHelper,
    ],
    exports: [ProveedoresService],
})
export class ProveedoresModule { }