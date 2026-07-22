import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Sucursal } from 'src/decorators/session.decorator';
import { LotesService } from './lotes.service';
import { FiltrosLotesDTO, LotesListaResponseDTO } from './dto/lotes.dto';

@ApiTags('Lotes')
@ApiBearerAuth()
@Controller('lotes')
export class LotesController {
    constructor(
        private readonly service: LotesService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Obtener lista de lotes para gestor visual' })
    async obtenerLotes(
        @Query() filtros: FiltrosLotesDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<LotesListaResponseDTO> {
        return this.service.obtenerLotes(filtros, sucursalId);
    }
}