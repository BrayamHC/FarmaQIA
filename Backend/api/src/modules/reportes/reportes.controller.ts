import { Controller, Get, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { Sucursal } from 'src/decorators/session.decorator';
import { ReportesCoordinator } from './reportes.coordinator';
import {
    FiltrosFechasDTO,
    FormatoExportacionDTO,
    ReporteInventarioResponseDTO,
    ReporteVentasResponseDTO,
    ReporteComprasResponseDTO,
} from './dto/reportes.dto';

@ApiTags('Reportes')
@ApiBearerAuth()
@Controller('reportes')
export class ReportesController {
    constructor(private readonly coordinator: ReportesCoordinator) { }

    @Get('inventario')
    @ApiOperation({ summary: 'Obtener reporte de inventario' })
    async obtenerInventario(
        @Query() filtros: FiltrosFechasDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ReporteInventarioResponseDTO> {
        return this.coordinator.obtenerInventario(filtros, sucursalId);
    }

    @Get('inventario/exportar')
    @ApiOperation({ summary: 'Exportar reporte de inventario a Excel o PDF' })
    async exportarInventario(
        @Query() filtros: FiltrosFechasDTO,
        @Query() exportacion: FormatoExportacionDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @Res() res: Response,
    ) {
        const buffer = await this.coordinator.exportarInventario(filtros, sucursalId, exportacion.formato);

        if (exportacion.formato === 'excel') {
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=reporte-inventario.xlsx',
            });
            return res.send(buffer);
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=reporte-inventario.pdf',
        });
        return res.send(buffer);
    }

    @Get('ventas')
    @ApiOperation({ summary: 'Obtener reporte de ventas' })
    async obtenerVentas(
        @Query() filtros: FiltrosFechasDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ReporteVentasResponseDTO> {
        return this.coordinator.obtenerVentas(filtros, sucursalId);
    }

    @Get('ventas/exportar')
    @ApiOperation({ summary: 'Exportar reporte de ventas a Excel o PDF' })
    async exportarVentas(
        @Query() filtros: FiltrosFechasDTO,
        @Query() exportacion: FormatoExportacionDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @Res() res: Response,
    ) {
        const buffer = await this.coordinator.exportarVentas(filtros, sucursalId, exportacion.formato);

        if (exportacion.formato === 'excel') {
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=reporte-ventas.xlsx',
            });
            return res.send(buffer);
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=reporte-ventas.pdf',
        });
        return res.send(buffer);
    }

    @Get('compras')
    @ApiOperation({ summary: 'Obtener reporte de compras' })
    async obtenerCompras(
        @Query() filtros: FiltrosFechasDTO,
        @Sucursal('sucursal_id') sucursalId: number,
    ): Promise<ReporteComprasResponseDTO> {
        return this.coordinator.obtenerCompras(filtros, sucursalId);
    }

    @Get('compras/exportar')
    @ApiOperation({ summary: 'Exportar reporte de compras a Excel o PDF' })
    async exportarCompras(
        @Query() filtros: FiltrosFechasDTO,
        @Query() exportacion: FormatoExportacionDTO,
        @Sucursal('sucursal_id') sucursalId: number,
        @Res() res: Response,
    ) {
        const buffer = await this.coordinator.exportarCompras(filtros, sucursalId, exportacion.formato);

        if (exportacion.formato === 'excel') {
            res.set({
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename=reporte-compras.xlsx',
            });
            return res.send(buffer);
        }

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=reporte-compras.pdf',
        });
        return res.send(buffer);
    }
}