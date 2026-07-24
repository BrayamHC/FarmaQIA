
import { Module } from '@nestjs/common';
import { VentasController } from './ventas.controller';
import { VentasCoordinator } from './ventas.coordinator';
import { VentasService } from './ventas.service';
import { VentasRepoAction } from './repositories/ventas.repoAction';
import { VentasRepoData } from './repositories/ventas.repoData';
import { VentasRepoHelper } from './repositories/ventas.repoHelper';

@Module({
    controllers: [VentasController],
    providers: [
        VentasCoordinator,
        VentasService,
        VentasRepoAction,
        VentasRepoData,
        VentasRepoHelper, // <-- falta
    ],
    exports: [VentasService],
})
export class VentasModule { }