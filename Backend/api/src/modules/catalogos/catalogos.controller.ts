import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CatalogosService } from './catalogos.service';
import {
    ActualizarSerieDTO,
    CambiarStatusSerieDTO,
    CrearSerieDTO,
    FiltrosSeriesDTO,
    FiltrosTiposDocumentoDTO,
    FiltrosUnidadesMedidaDTO,
} from './dto/catalogos.dto';
import { Sucursal, User } from 'src/decorators/session.decorator';

@ApiTags('Catálogos')
@ApiBearerAuth()
@Controller('catalogos')
export class CatalogosController {
    constructor(private readonly catalogosService: CatalogosService) { }

    @Get('tipos-documentos')
    @ApiOperation({ summary: 'Obtener tipos de documento' })
    async obtenerTiposDocumentos(@Query() filtros: FiltrosTiposDocumentoDTO) {
        const tipos = await this.catalogosService.obtenerTiposDocumentos(filtros);
        return { tipos_documentos: tipos };
    }

    @Get('categoras-subcategorias')
    @ApiOperation({ summary: 'Obtener categorías y subcategorías' })
    async obtenerCategoriasSub(@Query() filtros: FiltrosUnidadesMedidaDTO) {
        const categorias = await this.catalogosService.obtenerCategoriasSub(filtros);
        return { categorias: categorias };
    }


    @Get('unidades-medida')
    @ApiOperation({ summary: 'Obtener unidades de medida' })
    async obtenerUnidadesMedida(@Query() filtros: FiltrosUnidadesMedidaDTO) {
        const unidades = await this.catalogosService.obtenerUnidadesMedida(filtros);
        return { unidades_medida: unidades };
    }

    @Get('series')
    @ApiOperation({ summary: 'Obtener series por sucursal y filtros' })
    async obtenerSeries(
        @Query() filtros: FiltrosSeriesDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        const series = await this.catalogosService.obtenerSeries(sucursalId, filtros);
        return { series };
    }

    @Get('series/:uuid')
    @ApiOperation({ summary: 'Obtener una serie por UUID' })
    async obtenerSeriePorUUID(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        const serie = await this.catalogosService.obtenerSeriePorUUID(uuid, sucursalId);
        return { serie };
    }

    @Post('series')
    @ApiOperation({ summary: 'Crear nueva serie' })
    async crearSerie(
        @Body() body: CrearSerieDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.catalogosService.crearSerie(body, sucursalId, user);
    }

    @Patch('series/:uuid')
    @ApiOperation({ summary: 'Actualizar serie' })
    async actualizarSerie(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: ActualizarSerieDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.catalogosService.actualizarSerie(uuid, body, sucursalId, user);
    }

    @Patch('series/:uuid/default')
    @ApiOperation({ summary: 'Marcar serie como default' })
    async setSerieDefault(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.catalogosService.setSerieDefault(uuid, sucursalId, user);
    }

    @Patch('series/:uuid/status')
    @ApiOperation({ summary: 'Activar o desactivar serie' })
    async cambiarStatusSerie(
        @Param('uuid', ParseUUIDPipe) uuid: string,
        @Body() body: CambiarStatusSerieDTO,
        @User() user: any,
        @Sucursal('sucursal_id') sucursalId: number,
    ) {
        return this.catalogosService.cambiarStatusSerie(uuid, body, sucursalId, user);
    }
}