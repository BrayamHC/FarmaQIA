import { Module } from '@nestjs/common';
import { ReportesController } from './reportes.controller';
import { ReportesCoordinator } from './reportes.coordinator';
import { ReportesService } from './reportes.service';
import { ReportesRepoData } from './repositories/reportes.repoData';
import { ReportesRepoHelper } from './repositories/reportes.repoHelper';
import { ReportesBO } from './repositories/reportes.bo';
import { ExcelGenerator } from './generadores/excel.generator';
import { PdfGenerator } from './generadores/pdf.generator';

@Module({
    controllers: [ReportesController],
    providers: [
        ReportesCoordinator,
        ReportesService,
        ReportesRepoData,
        ReportesRepoHelper,
        ReportesBO,
        ExcelGenerator,
        PdfGenerator,
    ],
    exports: [ReportesService],
})
export class ReportesModule { }