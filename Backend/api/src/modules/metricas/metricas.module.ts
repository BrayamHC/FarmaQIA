// metricas.module.ts
import { Module } from '@nestjs/common';
import { MetricasController } from './metricas.controller';
import { MetricasService } from './metricas.service';
import { MetricasRepoData } from './repositories/metricas.repoData';

@Module({
    controllers: [MetricasController],
    providers: [MetricasService, MetricasRepoData],
})
export class MetricasModule { }