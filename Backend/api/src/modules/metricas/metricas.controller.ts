// metricas.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Sucursal } from 'src/decorators/session.decorator';
import { MetricasService } from './metricas.service';
import {
    FiltroCaducidadDTO,
    ResumenMetricasResponseDTO,
    VentasSemanaResponseDTO,
    InventarioCategoriaResponseDTO,
    CaducidadesResponseDTO,
} from './dto/metricas.dto';

@ApiTags('Metricas')
@ApiBearerAuth()
@Controller('metricas')
export class MetricasController {
    constructor(private readonly service: MetricasService) { }

    @Get('resumen')
    @ApiOperation({ summary: 'KPIs generales del dashboard' })
    async obtenerResumen(
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ResumenMetricasResponseDTO> {
        return this.service.obtenerResumen(sucursalId);
    }

    @Get('ventas-semana')
    @ApiOperation({ summary: 'Serie de ventas de los últimos 7 días' })
    async obtenerVentasSemana(
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<VentasSemanaResponseDTO> {
        return this.service.obtenerVentasSemana(sucursalId);
    }

    @Get('inventario-categoria')
    @ApiOperation({ summary: 'Distribución de stock por categoría' })
    async obtenerInventarioPorCategoria(
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<InventarioCategoriaResponseDTO> {
        return this.service.obtenerInventarioPorCategoria(sucursalId);
    }

    @Get('caducidades')
    @ApiOperation({ summary: 'Lotes agrupados por proximidad de caducidad' })
    async obtenerCaducidades(
        @Query() filtros: FiltroCaducidadDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<CaducidadesResponseDTO> {
        return this.service.obtenerCaducidades(filtros, sucursalId);
    }
}