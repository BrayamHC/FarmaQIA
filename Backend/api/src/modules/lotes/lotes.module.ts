import { Module } from '@nestjs/common';
import { LotesController } from './lotes.controller';
import { LotesService } from './lotes.service';
import { LotesBO } from './repositories/lotes.bo';
import { LotesRepoData } from './repositories/lotes.repoData';
import { LotesRepoHelper } from './repositories/lotes.repoHelper';

@Module({
    controllers: [LotesController],
    providers: [
        LotesService,
        LotesBO,
        LotesRepoData,
        LotesRepoHelper,
    ],
    exports: [LotesService],
})
export class LotesModule { }