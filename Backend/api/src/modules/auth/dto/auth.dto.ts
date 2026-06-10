import { createZodDto } from 'nestjs-zod';
import {
    LoginSchema,
    LogoutSchema,
    SesionActualSchema,
} from './auth.validator';

export class LoginDTO extends createZodDto(LoginSchema) { }
export class LogoutDTO extends createZodDto(LogoutSchema) { }
export class SesionActualResponseDTO extends createZodDto(SesionActualSchema) { }