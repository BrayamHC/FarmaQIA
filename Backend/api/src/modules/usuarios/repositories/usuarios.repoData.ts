// import { Injectable, Inject } from '@nestjs/common';
// import { Knex } from 'knex';
// import { FiltrosRoles, FiltrosUsuarios } from '../dto/usuarios.validator';
// import { UsuariosRepoHelper } from './usuarios.repoHelper';

// @Injectable()
// export class UsuariosRepoData {
//     constructor(
//         @Inject('TENANT_CONNECTION') private readonly knex: Knex,
//         private readonly repoHelper: UsuariosRepoHelper,
//     ) { }

//     async obtenerUsuarios(filtros: FiltrosUsuarios) {
//         let query = this.knex('usuarios as u')
//             .select(
//                 // 'u.usuario_id',
//                 'u.usuario_uuid',
//                 'u.nombre_completo',
//                 'u.email',
//                 'u.telefono',
//                 'u.status',
//                 'u.fecha_creacion',
//                 'cr.descripcion as rol_nombre',
//             )
//             .leftJoin('cat_roles as cr', 'u.rol_id', 'cr.rol_id')
//             .whereNot('u.email', 'system@deltaerp.com')
//             .orderBy('u.nombre_completo', 'asc');

//         query = this.repoHelper.aplicarFiltros(query, filtros);

//         return query;
//     }

//     async obtenerUsuarioPorUuid(uuid: string) {
//         return this.knex('usuarios as u')
//             .select(
//                 'u.usuario_id',
//                 'u.usuario_uuid         as uuid',
//                 'u.nombre_completo',
//                 'u.email',
//                 'u.telefono',
//                 'u.status',
//                 'u.fecha_creacion',
//                 'cr.rol_id',
//                 'cr.descripcion         as rol_descripcion',
//             )
//             .leftJoin('cat_roles as cr', 'u.rol_id', 'cr.rol_id')
//             .where('u.usuario_uuid', uuid)
//             .first();
//     }

//     async obtenerUsuariosAdmin() {
//         return this.knex('usuarios as u')
//             .select(
//                 'u.usuario_id',
//                 'u.usuario_uuid',
//                 'u.nombre_completo',
//                 'u.email',
//                 'u.telefono',
//                 'u.status',
//                 'u.fecha_creacion',
//                 'cr.descripcion as rol_nombre',
//             )
//             .leftJoin('cat_roles as cr', 'u.rol_id', 'cr.rol_id')
//             .where('u.rol_id', 1)
//             .andWhere('u.status', 'activo')
//             .orderBy('u.nombre_completo', 'asc');
//     }

//     async obtenerRoles(filtros: FiltrosRoles) {
//         let query = this.knex('cat_roles as cr')
//             .select(
//                 'cr.rol_uuid',
//                 // 'r.rol_id',
//                 'cr.descripcion',
//                 'cr.status',
//             );
//         query = this.repoHelper.aplicarFiltrosRoles(query, filtros);
//         return query;
//     }

//     async obtenerRolPorUuid(uuid: string) {
//         return this.knex('cat_roles')
//             .where('rol_uuid', uuid)
//             .where('status', 'activo')
//             .select('rol_id')
//             .first();
//     }

//     async obtenerSucursalesDeUsuario(usuario_id: number) {
//         return this.knex('rel_sucursales_usuarios as r')
//             .select(
//                 's.sucursal_uuid',
//                 's.nombre',
//                 's.nombre_comercial',
//             )
//             .join('sucursales as s', 'r.sucursal_id', 's.sucursal_id')
//             .where('r.usuario_id', usuario_id)
//             .where('r.es_activa', true)
//             .where('s.status', 'activo');
//     }

//     async obtenerSucursalIdsPorUuids(uuids: string[]) {
//         return this.knex('sucursales')
//             .whereIn('sucursal_uuid', uuids)
//             .where('status', 'activo')
//             .select('sucursal_id', 'sucursal_uuid', 'nombre');
//     }

//     async obtenerSucursalIdsDeUsuario(usuario_id: number): Promise<number[]> {
//         const rows = await this.knex('rel_sucursales_usuarios')
//             .where('usuario_id', usuario_id)
//             .where('es_activa', true)
//             .select('sucursal_id');
//         return rows.map(r => r.sucursal_id);
//     }

//     async obtenerTotalUsuarios() {
//         const result = await this.knex('usuarios')
//             .whereNot('email', 'system@deltaerp.com')
//             .count({ total: '*' });

//         return Number(result[0].total);
//     }

//     // Obtiene los permisos efectivos = rol + grants - denys
//     async obtenerPermisosEfectivosDeUsuario(usuarioId: number) {
//         const permisosRol = await this.knex('usuarios as u')
//             .join('cat_roles as r', 'r.rol_id', 'u.rol_id')
//             .join('rel_roles_permisos as rrp', 'rrp.rol_id', 'r.rol_id')
//             .join('cat_permisos as cp', 'cp.permiso_id', 'rrp.permiso_id')
//             .where('u.usuario_id', usuarioId)
//             .where('cp.status', 'activo')
//             .select('cp.permiso_id', 'cp.modulo', 'cp.descripcion');

//         const overrides = await this.knex('rel_usuarios_permisos as rup')
//             .join('cat_permisos as cp', 'cp.permiso_id', 'rup.permiso_id')
//             .where('rup.usuario_id', usuarioId)
//             .select('cp.permiso_id', 'cp.modulo', 'cp.descripcion', 'rup.tipo');

//         const grants = overrides.filter(o => o.tipo === 'grant');
//         const denys = overrides.filter(o => o.tipo === 'deny').map(o => o.permiso_id);

//         const permisosEfectivos = [
//             ...permisosRol.filter(p => !denys.includes(p.permiso_id)),
//             ...grants
//                 .filter(g => !permisosRol.find(p => p.permiso_id === g.permiso_id))
//                 .map(({ tipo, ...resto }) => resto),
//         ];

//         return {
//             permisos_efectivos: permisosEfectivos,          // ← rol + grants - denys
//             overrides_grant: grants.map(({ tipo, ...resto }) => resto),
//             overrides_deny: overrides
//                 .filter(o => o.tipo === 'deny')
//                 .map(({ tipo, ...resto }) => resto),
//         };
//     }

//     async obtenerOverridesDeUsuario(usuarioId: number) {
//         return this.knex('rel_usuarios_permisos as rup')
//             .join('cat_permisos as cp', 'cp.permiso_id', 'rup.permiso_id')
//             .where('rup.usuario_id', usuarioId)
//             .select(
//                 'cp.permiso_id',
//                 'cp.modulo',
//                 'cp.accion',
//                 'cp.descripcion',
//                 'rup.tipo',
//             )
//             .orderBy('cp.modulo_orden', 'asc');
//     }

//     async permisosExistesPorIds(permiso_ids: number[]): Promise<boolean> {
//         const resultado = await this.knex('cat_permisos')
//             .whereIn('permiso_id', permiso_ids)
//             .where('status', 'activo')
//             .count('permiso_id as total')
//             .first();

//         return Number(resultado?.total) === permiso_ids.length;
//     }

//     async obtenerUsuariosPorUuids(uuids: string[]) {
//         return this.knex('usuarios')
//             .whereIn('usuario_uuid', uuids)
//             .where('status', 'activo')
//             .select('usuario_id', 'usuario_uuid', 'nombre_completo', 'email');
//     }
// }
