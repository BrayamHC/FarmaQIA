import { Injectable, Logger } from '@nestjs/common';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { FiltrosFechasDTO } from './dto/reportes.dto';
import { ReportesRepoData } from './repositories/reportes.repoData';
import { ReportesBO } from './repositories/reportes.bo';
import { ExcelGenerator } from './generadores/excel.generator';
import { PdfGenerator } from './generadores/pdf.generator';

@Injectable()
export class ReportesService {
    private readonly logger = new Logger(ReportesService.name);

    constructor(
        private readonly repoData: ReportesRepoData,
        private readonly bo: ReportesBO,
        private readonly excelGenerator: ExcelGenerator,
        private readonly pdfGenerator: PdfGenerator,
    ) { }

    async obtenerReporteInventario(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const data = await this.repoData.obtenerInventario(filtros, sucursalId);
            return this.bo.construirReporteInventario(data, sucursalId, filtros);
        } catch (error) {
            this.logger.error('obtenerReporteInventario', error);
            throw new DatabaseQueryException('Error al generar reporte de inventario');
        }
    }

    async obtenerReporteVentas(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const data = await this.repoData.obtenerVentas(filtros, sucursalId);
            return this.bo.construirReporteVentas(data, sucursalId, filtros);
        } catch (error) {
            this.logger.error('obtenerReporteVentas', error);
            throw new DatabaseQueryException('Error al generar reporte de ventas');
        }
    }

    async obtenerReporteCompras(filtros: FiltrosFechasDTO, sucursalId: number) {
        try {
            const data = await this.repoData.obtenerCompras(filtros, sucursalId);
            return this.bo.construirReporteCompras(data, sucursalId, filtros);
        } catch (error) {
            this.logger.error('obtenerReporteCompras', error);
            throw new DatabaseQueryException('Error al generar reporte de compras');
        }
    }

    async exportarInventarioExcel(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteInventario(filtros, sucursalId);
        return this.excelGenerator.generarInventario(reporte);
    }

    async exportarInventarioPdf(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteInventario(filtros, sucursalId);
        return this.pdfGenerator.generarInventario(reporte);
    }

    async exportarVentasExcel(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteVentas(filtros, sucursalId);
        return this.excelGenerator.generarVentas(reporte);
    }

    async exportarVentasPdf(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteVentas(filtros, sucursalId);
        return this.pdfGenerator.generarVentas(reporte);
    }

    async exportarComprasExcel(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteCompras(filtros, sucursalId);
        return this.excelGenerator.generarCompras(reporte);
    }

    async exportarComprasPdf(filtros: FiltrosFechasDTO, sucursalId: number): Promise<Buffer> {
        const reporte = await this.obtenerReporteCompras(filtros, sucursalId);
        return this.pdfGenerator.generarCompras(reporte);
    }
}