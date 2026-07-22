import { Injectable } from '@nestjs/common';
import { FiltrosLotesDTO } from '../dto/lotes.dto';

@Injectable()
export class LotesBO {
    construirFiltros(filtros: FiltrosLotesDTO) {
        return {
            ...filtros,
            page: filtros?.page ?? 1,
            limit: filtros?.limit ?? 20,
        };
    }
}