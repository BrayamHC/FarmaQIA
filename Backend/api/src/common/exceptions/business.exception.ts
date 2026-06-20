import { HttpException, HttpStatus } from '@nestjs/common';
import { formattedDate } from 'src/utils/date.utils';

export class BusinessException extends HttpException {
    constructor(
        message: string,
        statusCode: HttpStatus = HttpStatus.UNPROCESSABLE_ENTITY,
        public readonly errorCode?: string,
        public readonly details?: any
    ) {
        super(
            {
                success: false,
                message,
                details,
                errorCode,
            },
            statusCode,
        );
    }
}

// Credenciales invalidas
export class InvalidCredentialsException extends BusinessException {
    constructor(message = 'Email o contraseña incorrectos') {
        super(message, HttpStatus.UNAUTHORIZED, 'INVALID_CREDENTIALS');
    }
}

// Recurso no encontrado
export class ResourceNotFoundException extends BusinessException {
    constructor(resource: string, identifier?: string | number) {
        const message = identifier
            ? `${resource} con identificador: ${identifier} no encontrado`
            : `${resource} no encontrado`;
        super(message, HttpStatus.NOT_FOUND, 'RESOURCE_NOT_FOUND');
    }
}

export class SucursalNotSelectedException extends BusinessException {
    constructor(message = "No hay sucursal seleccionada") {
        super(message, HttpStatus.PRECONDITION_REQUIRED, 'SUCURSAL_REQUIRED')
    }
}

// Recurso duplicado
export class DuplicateResourceException extends BusinessException {
    constructor(resource: string, field: string, value?: string) {
        super(
            `Ya existe un ${resource} con ese ${field}: ${value}`,
            HttpStatus.CONFLICT,
            'DUPLICATE_RESOURCE',
        );
    }
}

// Usuario inactivo
export class InactiveUserException extends BusinessException {
    constructor(message = 'Usuario inactivo') {
        super(message, HttpStatus.FORBIDDEN, 'INACTIVE_USER');
    }
}

// Despacho inactivo
export class InactiveDespachoException extends BusinessException {
    constructor(message = 'Despacho inactivo') {
        super(message, HttpStatus.FORBIDDEN, 'INACTIVE_DESPACHO');
    }
}

// Sesion expirada
export class SessionExpiredException extends BusinessException {
    constructor(message = 'Sesion expirada o invalida') {
        super(message, HttpStatus.UNAUTHORIZED, 'SESSION_EXPIRED');
    }
}


//Validacion de datos
export class ValidationException extends BusinessException {
    constructor(
        message: string,
        public readonly errors?: Array<{ campo: string; mensaje: string }>,
    ) {
        super(message, HttpStatus.BAD_REQUEST, 'VALIDATION_ERROR');
    }

    getResponse() {
        return {
            success: false,
            message: this.message,
            errorCode: 'VALIDATION_ERROR',
            errors: this.errors,
            timestamp: formattedDate(),
        };
    }
}
