import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { DATABASE_CONNECTION } from 'src/config/database.constants';
DatabaseQueryException
@Injectable()
export class SucursalesRepoAction {
    private readonly logger = new Logger(SucursalesRepoAction.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) { }

    async insertarSucursal(datos: any): Promise<any> {
        try {
            const [sucursal] = await this.knex('sucursales')
                .insert(datos)
                .returning('*');
            return sucursal;
        } catch (error) {
            this.logger.error('insertarSucursal', error);
            throw new DatabaseQueryException('Error al crear la sucursal');
        }
    }

    async actualizarSucursal(uuid: string, datos: any): Promise<any> {
        try {
            await this.knex('sucursales')
                .where('sucursal_uuid', uuid)
                .update(datos);

            return this.knex('sucursales')
                .where('sucursal_uuid', uuid)
                .first();
        } catch (error) {
            this.logger.error('actualizarSucursal', error);
            throw new DatabaseQueryException('Error al actualizar la sucursal');
        }
    }

    async cambiarStatus(uuid: string, status: string, usuario: any): Promise<any> {
        try {
            await this.knex('sucursales')
                .where('sucursal_uuid', uuid)
                .update({
                    status,
                    usuario_actualizacion: usuario.usuario_id,
                    fecha_actualizacion: new Date(),
                });

            return this.knex('sucursales')
                .where('sucursal_uuid', uuid)
                .first();
        } catch (error) {
            this.logger.error('cambiarStatus', error);
            throw new DatabaseQueryException('Error al cambiar status de la sucursal');
        }
    }
}