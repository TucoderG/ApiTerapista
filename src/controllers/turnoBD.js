const em = require('../errors/messages');
const { validacionEntrada } = require('./funcionesGeneralesDB');
const { getConnection, closeConnection, commitPool } = require('../db/accesoDB');
const { validarTurnosPaciente, validarFechaTurno, getSemana, esDomingo } = require('../funciones/date');

const date = new Date();
const dia = date.getDate();
const mes = date.getMonth() + 1;
const anio = date.getFullYear();




const getTurno = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);


    const pool= await getConnection();

    try{
        if(message !== "") throw new Error(message);
        const { id_turno } = req.body;

        const result = await pool.execute("SELECT * FROM Turno WHERE id_turno = :id_turno",
        [id_turno]);

        if(!result.rows[0]) throw new Error(em.NO_ENCONTRE_TURNOS);
        return res.status(200).json({"status": "succes", "Turnos": result.rows});
        
    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({"status": "error", "Error": error});

    }finally{
        closeConnection(pool); 
    }

}

const postTurno = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        // Obtengo los datos del body del request
        const { id_terapista, dni_paciente, fecha, desde } = req.body;

        await validarTurnosPaciente(pool, fecha, id_terapista);
        
        if(esDomingo(fecha)) throw new Error(em.DOMINGO);
        
        await validarFechaTurno(pool, fecha, desde, id_terapista);
        
        const consultaTurno = await pool.execute(
            "SELECT nvl(max(id_turno), 0) FROM Turno"
        )
        if(!consultaTurno.rows[0]) throw new Error(em.NO_ENCONTRE_TURNOS);
        const id_turno = consultaTurno.rows[0][0] + 1
        // Inserto el registro
        const result = await pool.execute(
            "INSERT INTO Turno VALUES(:id_turno, :dni_paciente, :id_terapista, :fecha, :desde, 'Pendiente')",
            [id_turno, dni_paciente, id_terapista, fecha, desde]);
        
        // Verifico que se inserto el registro
        if(result.rowsAffected < 1) throw new Error(em.NO_MODIFICO);
        
        // Hago un commit de los cambios
        commitPool(pool);
        const una_semana = getSemana();
        
        const turnos = await pool.execute(
            "SELECT id_turno, fecha, id_terapista, desde FROM Turno WHERE dni_paciente = :dni_paciente AND asistencia LIKE 'Pendiente' AND id_terapista = :id_terapista AND to_date(fecha, 'DD-MM-YYYY') BETWEEN to_date(to_char(sysdate), 'DD-MM-YYYY') AND to_date(:una_semana, 'DD-MM-YYYY')",
            [dni_paciente, id_terapista, una_semana]
        )
        // Devuelvo la respuesta
        return res.status(200).json({"status": 'succes', msg: `Turno creado correctamente. ID_TURNO: ${id_turno} --- Tienes estos turnos pendientes.. ${turnos.rows}`});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({"status": 'error', error: error.message});
        }
        return res.status(400).json({"status": 'error', error: error.message});

    }finally{
        // Finalizo la conexión con la BD.
        closeConnection(pool);                        
    }
}


const delTurno = async (req, res) => {
    const pool = await getConnection();
    
    try{
        var { id_turno } = req.body;
        
        const result = await pool
        .execute("DELETE FROM Turno WHERE id_turno = :id_turno", [ id_turno ]);
        

        if(result.rowsAffected < 1) throw new Error(em.NO_ELIMINAR); 

        commitPool(pool);

        return res.status(200).json({status: 'succes', msg: 'Turno Eliminado.'});

    }catch(error){
        return res.status(404).json({status: 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
    
}


const putTurno = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        var { id_turno, fecha } = req.body;
        
        const result = await pool
        .execute("UPDATE Turno SET fecha = :fecha WHERE id_turno = :id_turno", [ fecha, id_turno ]);
        
        if(result.rowsAffected < 1) throw new Error(em.NO_MODIFICAR_FECHA); 
    
        commitPool(pool);

        return res.status(200).json({"status": 'succes', msg: `Fecha del Turno ${id_turno} Modificada.`});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({"status": 'error', error: error.message});
        }
        return res.status(304).json({"status": 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
}


const cancelarTurno = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        var { id_usuario, id_turno } = req.body;

        const res = await pool.execute("SELECT asistencia FROM Turno WHERE id_turno = :id_turno AND dni_paciente = :id_usuario", [id_turno, id_usuario]);
        if(!res.rows[0]) throw new Error (em.NO_ENCONTRE_TURNOS);
        
        const asistencia = res.rows[0][0];
        // Verifico que el turno siga en "pendiente"
        if(asistencia === 'Cancelado') throw new Error(em.TURNO_CANCELADO_ANTERIORMENTE);
        if(asistencia === 'Asistido') throw new Error(em.YA_ASISTIO_AL_TURNO);

        
        // Actualiza el turno solamente si no es el mismo dia en el que debe asistir
        const result = await pool.execute("UPDATE Turno SET asistencia = 'Cancelado' WHERE id_turno = :id_turno AND dni_paciente = :id_usuario AND to_date(fecha, 'DD-MM-YYYY') != to_date(sysdate, 'DD-MM-YYYY')",
        [id_turno, id_usuario]);

        if(result.rowsAffected < 1) throw new Error(em.TURNO_NO_CANCELADO); 
        
        commitPool(pool);
        return res.status(200).json({"status": 'succes', msg: `Turno ${id_turno} Cancelado..`});

    }catch(error){
        
        if(error.message.includes("Ingrese")){
            return res.status(409).json({"status": 'error', error: error.message});
        }
        return res.status(400).json({"status": 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
}

const getTurnosEnSemana = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);


    const pool= await getConnection();

    try{
        if(message !== "") throw new Error(message);
        const { id } = req.body;

        if(mes < 10){
            var fecha_hoy = `${dia}-0${mes}-${anio}`

        }else{
            var fecha_hoy = `${dia}-${mes}-${anio}`

        }

        // Obtengo la fecha de una semana exacta
        var una_semana_despues = getSemana();


        const result = await pool.execute(
            "SELECT * FROM Turno WHERE dni_paciente = :id AND to_date(fecha, 'DD-MM-YYYY') between to_date(:fecha_hoy, 'DD-MM-YYYY') AND to_date(:una_semana_despues, 'DD-MM-YYYY')",
        [id, fecha_hoy, una_semana_despues]);

        if(!result.rows[0]) throw new Error(em.NO_ENCONTRE_TURNOS);
        return res.status(200).json({"status": "succes", "Turnos": result.rows});
        
    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({"status": "error", "Error": error.message});

    }finally{
        closeConnection(pool); 
    }

}

module.exports = {
    getTurno,
    postTurno,
    delTurno,
    putTurno,
    cancelarTurno,
    getTurnosEnSemana,

}