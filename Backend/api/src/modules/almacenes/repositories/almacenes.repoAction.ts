import { Inject, Injectable, Logger } from '@nestjs/common';
import { Knex } from 'knex';
import { DatabaseQueryException } from 'src/common/exceptions/technical.exception';
import { DATABASE_CONNECTION } from 'src/config/database.constants';

@Injectable()
export class AlmacenesRepoAction {
    private readonly logger = new Logger(AlmacenesRepoAction.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly knex: Knex) { }

    // Retorna el UUID del almacén creado para hacer el select posterior en service
    async insertarAlmacen(datos: any): Promise<string> {
        try {
            const [almacen] = await this.knex('almacenes')
                .insert(datos)
                .returning(['almacen_uuid']);

            return almacen.almacen_uuid;
        } catch (error) {
            this.logger.error('insertarAlmacen', error);
            throw new DatabaseQueryException('Error al crear el almacén');
        }
    }

    // Retorna el UUID del almacén actualizado para hacer el select posterior en service
    async actualizarAlmacen(almacenId: number, datos: any): Promise<string> {
        try {
            const [almacen] = await this.knex('almacenes')
                .where('almacen_id', almacenId)
                .update(datos)
                .returning(['almacen_uuid']);

            return almacen.almacen_uuid;
        } catch (error) {
            this.logger.error('actualizarAlmacen', error);
            throw new DatabaseQueryException('Error al actualizar el almacén');
        }
    }
}