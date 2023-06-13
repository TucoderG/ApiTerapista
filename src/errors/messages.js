module.exports = {


    // GENERALES
    DOMINGO:  'No puede dar de alta un turno los dias domingo..',
    NO_TOKEN: 'Falta el token o token invalido..',
    NO_USUARIO: 'No existe un usuario con ese token..',

    // BASE DE DATOS
    NO_REGISTROS: 'No se encontro ningun registro..',
    NO_MODIFICO: 'No se modifico ninguna fila..',
    NO_ELIMINAR: 'No se pudo eliminar el registro',

    ORA_00001: "Ya existe ese usuario..",

    // ADMIN
    NO_ES_ADMIN: 'El usuario ingresado no es un administrador del sistema..',
    FALLO_PASS_ADMIN: 'Contraseña del administrador incorrecta..',

    // USUARIO
    USUARIO_NO_ENCONTRADO:'No se encontro ningun usuario con el ID indicado..',
    USUARIO_NO_INSERTADO: 'No se pudo agregar al usuario..',
    USUARIO_NO_ELIMINADO: 'No se pudo eliminar al usuario..',
    ROL_NO_PERMITIDO: 'No puede acceder a este endpoint con ese rol..',
    NO_MANIPULAR_OTROS: 'No puede acceder a los datos de otro usuario..',


    // PACIENTE
    NO_ENCONTRO_PACIENTE: 'No se encontro ningun paciente..',
    PACIENTE_NO_INSERTADO: 'No se pudo agregar al paciente..',
    EMAIL_NO_ACTUALIZADO: 'No se pudo actualizar el email del Paciente...',
    PACIENTE_NO_ELIMINADO: 'No se pudo eliminar al Paciente.',
    NO_HISTORIAL: 'No se encontro un historial del paciente...', 

    // PATOLOGIA
    NO_ENCONTRO_PATOLOGIA: 'No se encontro una patologia con ese nombre en el sistema..',

    // TURNO
    NO_ENCONTRE_TURNOS: 'No se encontró ningun turno..',
    NO_MODIFICAR_FECHA: 'No se pudo actualizar la fecha del turno...',
    HORARIO_OCUPADO: 'Horario ocupado..',
    DEMACIADOS_TURNOS: 'No puede solicitar más turnos por esta semana..',
    NO_CANCELAR_MISMO_DIA: 'No se puede cancelar un turno el mismo dia que lo tiene..',
    TURNO_CANCELADO_ANTERIORMENTE: 'El turno ya habia sido cancelado',
    TURNO_NO_CANCELADO: 'El turno no pudo cancelarce..',
    YA_ASISTIO_AL_TURNO: 'Usted ya asistio a la consulta..',
    

    // TERAPISTA
    NO_ENCONTRE_TERAPISTAS: 'No se encontró ningun terapista..',
    NO_MODIFICAR_TURNO_ASIGNADO: 'No se pudo actualizar el turno del terapista...',

    // EXCEL
    NO_DESCARGAR_ARCHIVO: 'Error al descargar el archivo..',


}   