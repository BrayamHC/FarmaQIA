// usuarios.dto.ts
import { createZodDto } from 'nestjs-zod';
import { CrearUsuarioSchema, AsignarSucursalesSchema, FiltrosUsuariosSchema, FiltrosRolesSchema, AgregarOverridesSchema, ReemplazarOverridesSchema, EditarUsuarioSchema, EditarUsuarioResponseSchema, UsuarioDetalleResponseSchema } from './usuarios.validator';

export class CrearUsuarioDTO extends createZodDto(CrearUsuarioSchema) { }
export class AsignarSucursalesDTO extends createZodDto(AsignarSucursalesSchema) { }
export class FiltrosUsuariosDTO extends createZodDto(FiltrosUsuariosSchema) { }
export class FiltrosRolesDTO extends createZodDto(FiltrosRolesSchema) { }
export class AgregarOverridesDTO extends createZodDto(AgregarOverridesSchema) { }
export class ReemplazarOverridesDTO extends createZodDto(ReemplazarOverridesSchema) { }
export class EditarUsuarioDTO extends createZodDto(EditarUsuarioSchema) { }
export class EditarUsuarioResponseDTO extends createZodDto(EditarUsuarioResponseSchema) { }
export class UserDetailsResponseDTO extends createZodDto(UsuarioDetalleResponseSchema) { }