import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';

import { CatalogosController } from './catalogos.controller';
import { CatalogosService } from './catalogos.service';

import { CatalogosBO } from './repositories/catalogos.bo';
import { CatalogosRepoAction } from './repositories/catalogos.repoAction';
import { CatalogosRepoData } from './repositories/catalogos.repoData';
import { CatalogosRepoHelper } from './repositories/catalogos.repoHelper';

@Module({
    imports: [DatabaseModule],
    controllers: [CatalogosController],
    providers: [
        CatalogosService,
        CatalogosBO,
        CatalogosRepoAction,
        CatalogosRepoData,
        CatalogosRepoHelper,
    ],
    exports: [
        CatalogosService,
    ],
})
export class CatalogosModule { }