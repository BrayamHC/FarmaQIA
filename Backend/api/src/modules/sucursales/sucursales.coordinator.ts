import { Injectable, Logger } from '@nestjs/common';
import { SucursalesService } from './sucursales.service';
import { AuthService } from '../auth/auth.service';
import { CrearSucursalDTO } from './dto/sucursales.dto';
import { ResourceNotFoundException } from 'src/common/exceptions/business.exception';

@Injectable()
export class SucursalesCoordinator {
    private readonly logger = new Logger(SucursalesCoordinator.name);

    constructor(
        private readonly service: SucursalesService,
        private readonly authService: AuthService,
    ) { }

    async crearSucursal(dto: CrearSucursalDTO, usuario: any, token: string) {
        // 1. Verificar nombre único
        const existeNombre = await this.service.existePorNombre(dto.nombre);
        if (existeNombre) {
            throw new Error(`Ya existe una sucursal con el nombre '${dto.nombre}'`);
        }

        // 2. Crear en BD
        const sucursalCreada = await this.service.crearSucursal(dto, usuario);

        // 3. Agregar a las sucursales_permitidas del token actual en Redis
        //    (permite que el usuario la seleccione en esta misma sesión)
        await this.authService.agregarSucursalPermitidaEnRedis(token, {
            sucursal_uuid: sucursalCreada.sucursal_uuid,
            sucursal_id: sucursalCreada.sucursal_id,
            nombre: sucursalCreada.nombre,
            nombre_comercial: sucursalCreada.nombre_comercial ?? null,
        });

        this.logger.log(
            `Sucursal creada: ${sucursalCreada.nombre} | usuario_id: ${usuario.usuario_id}`,
        );

        return {
            meta: { message: 'Sucursal creada exitosamente' },
            sucursal: sucursalCreada,
        };
    }
}