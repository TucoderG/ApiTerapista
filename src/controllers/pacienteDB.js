const em = require('../errors/messages');
const { getConnection, closeConnection, commitPool } = require('../db/accesoDB');
const { validacionEntrada } = require('./funcionesGeneralesDB');
const { getIdPatologia } = require('./patologiaDB');


async function getPacienteClase(dni){
    const pool = await getConnection();
    
    const result = await pool.execute("SELECT * FROM Paciente WHERE dni = :dni", [dni]);
    closeConnection(pool);
    
    if(!result.rows[0]) throw new Error(em.USUARIO_NO_ENCONTRADO);
    
    var paciente = [result.rows[0][0], result.rows[0][1], result.rows[0][2]];
    return paciente;
    
}


const getPaciente = async (req, res) => {
    var message = "";
    message = validacionEntrada(req);
    /*
        Trae de la BD un paciente con sus 3 campos (DNI, NOMBRE, EMAIL) desde su DNI 
    */

    
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        const { dni } = req.body;
        const result = await pool.execute("SELECT * FROM Paciente WHERE dni = :dni", [dni]);

        if(!result.rows[0]) throw new Error(em.NO_ENCONTRO_PACIENTE);
        return res.status(200).json({"status": "succes", "Paciente": result.rows});
        
    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({"status": "error", "Error": error});

    }finally{
        closeConnection(pool); 
    }
    
    
   
    
}

async function getHistPaciente(dni){

    /* 
        Devuelve el historial de un paciente  (NRO_TURNO, ID_TERAPISTA, FECHA, DESDE y ASISTENCIA) desde el dni del mismo
    */
    const pool = await getConnection();
    
    const result =  await pool.execute(
        "SELECT id_turno, id_terapista, fecha, desde, asistencia FROM turno WHERE dni_paciente = :dni AND asistencia LIKE 'Asistido' ORDER BY 3",
        [dni]
        );
    closeConnection(pool);
    if(!result.rows[0]) throw new Error(em.NO_HISTORIAL);


    return result.rows;
}


const postPaciente = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);


    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{

        if(message !== "") throw new Error(message);
        // Obtengo los datos del body del request
        var { dni, nombre, email, patologia } = req.body;
        dni = dni.replaceAll('.', '');

        var id_patologia = await getIdPatologia(pool, patologia);
        // Inserto el paciente

        const result = await pool.execute("INSERT INTO Paciente VALUES(:dni, :nombre, :email, :id_patologia)",
        [dni, nombre, email, id_patologia]);
       
        // Verifico que se inserto el paciente
        if(result.rowsAffected < 1) throw new Error(em.PACIENTE_NO_INSERTADO);
        
        // Hago un commit de los cambios
        commitPool(pool);

        // Devuelvo la respuesta
        return res.status(200).json({status: 'succes', msg: 'Paciente creado correctamente.'});

    }catch(error){
        if(error.message.includes("Ingrese ")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        
        return res.status(304).json({status: 'error', error: error.message});

    }finally{
        // Finalizo la conexión con la BD.
        closeConnection(pool);                        
    }
}

const putPaciente = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        var { dni, email } = req.body;
        dni = dni.replaceAll('.', '');
        if(!dni) throw new Error("Ingrese un DNI valido...")
        await getPacienteClase(dni);
        const result = await pool
        .execute("UPDATE Paciente SET(email) = (:email) WHERE DNI = :dni", [ email, dni ]);
        
        if(result.rowsAffected < 1) throw new Error(em.EMAIL_NO_ACTUALIZADO); 
    
       commitPool(pool);

        return res.status(200).json({status: 'succes', msg: `Email del Paciente ${dni} actualizado.`});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({status: 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
}


const delPaciente = async (req, res) => {
    var message = "";
    message = validacionEntrada(req);

    const pool = await getConnection();
    
    try{
        if(message !== "") throw new Error(message);
        var { dni } = req.body;
        dni = dni.replaceAll('.', '');
        if(!dni) throw new Error("Ingrese un DNI valido...")
        await getPacienteClase(dni);
        const result = await pool
        .execute("DELETE FROM Paciente WHERE DNI = :dni", [ dni ]);
        

        if(result.rowsAffected < 1) throw new Error(em.PACIENTE_NO_ELIMINADO); 
    

       commitPool(pool);

        return res.status(200).json({status: 'succes', msg: 'Paciente Eliminado.'});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({status: 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
    
}

module.exports = {
    getPacienteClase,
    getPaciente,
    getHistPaciente,
    postPaciente,
    putPaciente,
    delPaciente,
}