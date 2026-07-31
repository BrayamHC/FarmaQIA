import { Injectable } from '@nestjs/common';
import { FiltrosFechasDTO } from './dto/reportes.dto';
import { ReportesService } from './reportes.service';

@Injectable()
export class ReportesCoordinator {
    constructor(private readonly service: ReportesService) { }

    async obtenerInventario(filtros: FiltrosFechasDTO, sucursalId: number) {
        return this.service.obtenerReporteInventario(filtros, sucursalId);
    }

    async obtenerVentas(filtros: FiltrosFechasDTO, sucursalId: number) {
        return this.service.obtenerReporteVentas(filtros, sucursalId);
    }

    async obtenerCompras(filtros: FiltrosFechasDTO, sucursalId: number) {
        return this.service.obtenerReporteCompras(filtros, sucursalId);
    }

    async exportarInventario(filtros: FiltrosFechasDTO, sucursalId: number, formato: 'excel' | 'pdf') {
        if (formato === 'excel') {
            return this.service.exportarInventarioExcel(filtros, sucursalId);
        }
        return this.service.exportarInventarioPdf(filtros, sucursalId);
    }

    async exportarVentas(filtros: FiltrosFechasDTO, sucursalId: number, formato: 'excel' | 'pdf') {
        if (formato === 'excel') {
            return this.service.exportarVentasExcel(filtros, sucursalId);
        }
        return this.service.exportarVentasPdf(filtros, sucursalId);
    }

    async exportarCompras(filtros: FiltrosFechasDTO, sucursalId: number, formato: 'excel' | 'pdf') {
        if (formato === 'excel') {
            return this.service.exportarComprasExcel(filtros, sucursalId);
        }
        return this.service.exportarComprasPdf(filtros, sucursalId);
    }
}