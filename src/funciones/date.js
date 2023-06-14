const { getTrunoTerapista } = require('../controllers/terapistaDB');
const em = require('../errors/messages');
const { tieneDiferenciaDeTreinta } = require('./mats')


const date = new Date();
const dia_semana = date.getDay();
const dia_mes = date.getDate();
const mes = date.getMonth() + 1;
const anio = date.getFullYear();


// Verifico que hoy no sea domingo
function hoyEsDomingo(){
    
    return dia_semana == 0;
}

// Verifico que la fecha que ingresan no sea un domingo
function esDomingo(fecha){
    
    var datos = fecha.split("-")
    var date = new Date(datos[2], datos[1] - 1, datos[0])
    
    return date.getUTCDay() == 0; 

}


// Obtengo la semana en la que estoy
function getSemana(){    
    const una_semana = 7

    var cant_dias_mes_actual = new Date(anio, mes, 0)
    cant_dias_mes_actual = cant_dias_mes_actual.toLocaleString();
    cant_dias_mes_actual = cant_dias_mes_actual.replace(", 0:00:00", "");
    cant_dias_mes_actual = cant_dias_mes_actual.split("/");
    

    if(cant_dias_mes_actual[1] < 10) cant_dias_mes_actual[1] = `0${cant_dias_mes_actual[1]}`

    if((dia_mes + una_semana) >  cant_dias_mes_actual[0]){
        
        var una_semana_despues = `0${ (dia_mes + una_semana) - cant_dias_mes_actual[0] }-${ cant_dias_mes_actual[1] + 1 }-${ anio }`
        
    }else{
        var una_semana_despues = `${ dia_mes + una_semana }-${ cant_dias_mes_actual[1] }-${ anio }`
    }
    
    return una_semana_despues;
}


// Verifico que los horarios que se esten pidiendo y la fecha no este ocupada
const validarFechaTurno = async (pool, fecha, desde, id_terapista) => {

    
    // Obtengo los turnos del dia solicitado

    const result = await pool.execute("SELECT * FROM Turno WHERE to_date(fecha, 'DD-MM-YYYY') = to_date(:fecha, 'DD-MM-YYYY') AND id_terapista = :id_terapista AND asistencia LIKE 'Pendiente'",
    [fecha, id_terapista]);

    // Obtengo la cantidad de filas
    const filas = await pool.execute("SELECT COUNT(*) FROM Turno WHERE to_date(fecha, 'DD-MM-YYYY') = to_date(:fecha, 'DD-MM-YYYY') AND id_terapista = :id_terapista AND asistencia LIKE 'Pendiente'", 
    [fecha, id_terapista]);

    // Si no encuentro turnos regreso
    if(!result.rows[0]) return;
        
    // Obtengo la hora y minuto de la consulta
    const hora_desde = desde.split(":")
    
    
    // Busco entre el resto de turnos
    for(var i = 0; i < filas.rows[0][0]; i++){
        
        var hora_desde_row = result.rows[i][4].split(":")
        // Si coincide el horario de inicio o fin se verifica que no coincidan los minutos
        if(hora_desde[0] == hora_desde_row[0]){
            // Si llegase a coincidir la entrada o salida, no se podria pedir el turno (minimo 30m de diferencia)
            if(hora_desde[1] == hora_desde_row[1] || !tieneDiferenciaDeTreinta(hora_desde[1], hora_desde_row[1])) throw new Error(em.HORARIO_OCUPADO);
        }
    }
        
    

}


// Valida que el paciente tenga turno/s en pendiente 
const validarTurnosPaciente = async (pool, id_terapista)=>{
    const una_semana = getSemana();
    
    const result = await pool.execute("SELECT id_turno, asistencia FROM Turno WHERE to_date(fecha, 'DD-MM-YYYY') BETWEEN to_date(to_char(sysdate), 'DD-MM-YYYY') AND to_date(:una_semana, 'DD-MM-YYYY') AND id_terapista = :id_terapista",
    [ una_semana, id_terapista]);
    
    var contador = 0;
    if(!result.rows) return;

    // Si se obtienen turnos, verifico que no tenga 2 o más en pendiente para poder pedir otro turno
    result.rows.forEach(row => {
        if(row[1] === 'Pendiente') contador++;
        if(contador == 2) throw new Error(em.DEMACIADOS_TURNOS); 
        
    });

    
    


}

const validarTurnoTerapista = async (id_terapista, hora) =>{

    const turnoTerapista = await getTrunoTerapista(id_terapista);
    const arrHora = hora.split(":");
    switch(turnoTerapista){
        case 'Mañana':
            if(!(parseInt(arrHora[0]) >= 8 && parseInt(arrHora[0]) < 14)) throw new Error(em.TURNO_TERAPISTA_INVALIDO);
        break;
        case 'Tarde':
            if(!(parseInt(arrHora[0]) >= 14 && parseInt(arrHora[0]) < 18)) throw new Error(em.TURNO_TERAPISTA_INVALIDO);
        break;
        case 'Noche':
            if(!(parseInt(arrHora[0]) >= 18 && parseInt(arrHora[0]) < 22)) throw new Error(em.TURNO_TERAPISTA_INVALIDO);
        break;
        
    }
    
}



module.exports = {
    hoyEsDomingo,
    esDomingo,
    getSemana,
    validarFechaTurno,
    validarTurnosPaciente,
    validarTurnoTerapista,

}