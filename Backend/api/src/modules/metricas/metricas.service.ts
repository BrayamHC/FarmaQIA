// metricas.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { MetricasRepoData } from './repositories/metricas.repoData';
import { FiltroCaducidadDTO } from './dto/metricas.dto';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';

@Injectable()
export class MetricasService {
    private readonly logger = new Logger(MetricasService.name);

    constructor(private readonly repoData: MetricasRepoData) { }

    async obtenerResumen(sucursalId: number) {
        try {
            const [ventasDia, ventasSemana, productosBajos, proximosCaducar] = await Promise.all([
                this.repoData.ventasTotalPorRango(sucursalId, 'hoy'),
                this.repoData.ventasTotalPorRango(sucursalId, 'semana'),
                this.repoData.contarProductosBajos(sucursalId),
                this.repoData.contarProximosCaducar(sucursalId, 30),
            ]);

            return {
                ventas_dia: ventasDia,
                ventas_semana: ventasSemana,
                productos_bajos: productosBajos,
                proximos_caducar: proximosCaducar,
            };
        } catch (error) {
            this.logger.error('obtenerResumen', error);
            throw new DatabaseQueryException('Error al obtener resumen de métricas');
        }
    }

    async obtenerVentasSemana(sucursalId: number) {
        try {
            return await this.repoData.ventasPorDiaUltimaSemana(sucursalId);
        } catch (error) {
            this.logger.error('obtenerVentasSemana', error);
            throw new DatabaseQueryException('Error al obtener ventas de la semana');
        }
    }

    async obtenerInventarioPorCategoria(sucursalId: number) {
        try {
            return await this.repoData.stockPorCategoria(sucursalId);
        } catch (error) {
            this.logger.error('obtenerInventarioPorCategoria', error);
            throw new DatabaseQueryException('Error al obtener inventario por categoría');
        }
    }

    async obtenerCaducidades(filtros: FiltroCaducidadDTO, sucursalId: number) {
        try {
            return await this.repoData.lotesPorProximidadCaducidad(sucursalId, filtros.dias ?? 90);
        } catch (error) {
            this.logger.error('obtenerCaducidades', error);
            throw new DatabaseQueryException('Error al obtener caducidades');
        }
    }
}