import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { ClientesRepoData } from './repositories/clientes.repoData';
import { ClientesRepoAction } from './repositories/clientes.repoAction';
import { ClientesBO } from './repositories/clientes.bo';
import { ClientesRepoHelper } from './repositories/clientes.repoHelper';

@Module({
    imports: [DatabaseModule],
    controllers: [ClientesController],
    providers: [
        ClientesService,
        ClientesRepoData,
        ClientesRepoAction,
        ClientesBO,
        ClientesRepoHelper,
    ],
    exports: [ClientesService],
})
export class ClientesModule { }