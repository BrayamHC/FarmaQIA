import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/config/database.module';

import { AlmacenesController } from './almacenes.controller';
import { AlmacenesService } from './almacenes.service';
import { AlmacenesBO } from './repositories/almacenes.bo';
import { AlmacenesRepoAction } from './repositories/almacenes.repoAction';
import { AlmacenesRepoData } from './repositories/almacenes.repoData';
import { AlmacenesRepoHelper } from './repositories/almacenes.repoHelper';

@Module({
    imports: [DatabaseModule],
    controllers: [AlmacenesController],
    providers: [
        AlmacenesService,
        AlmacenesBO,
        AlmacenesRepoAction,
        AlmacenesRepoData,
        AlmacenesRepoHelper,
    ],
    exports: [AlmacenesService],
})
export class AlmacenesModule { }