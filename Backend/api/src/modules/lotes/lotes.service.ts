import { Injectable, Logger } from '@nestjs/common';
import { LotesRepoData } from './repositories/lotes.repoData';
import { FiltrosLotesDTO } from './dto/lotes.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class LotesService {
    private readonly logger = new Logger(LotesService.name);

    constructor(
        private readonly repoData: LotesRepoData,
    ) { }

    async obtenerLotes(filtros: FiltrosLotesDTO, sucursalId: number) {
        try {
            return await this.repoData.obtenerLotes(filtros, sucursalId);
        } catch (error) {
            this.logger.error('obtenerLotes', error);
            throw new DatabaseQueryException('Error al obtener lotes');
        }
    }
}