const { getConnection, closeConnection, commitPool } = require('../db/accesoDB');
const { validacionEntrada } = require('./funcionesGeneralesDB');
const em = require('../errors/messages');

async function getTerapistaClase(id_terapista){
    const pool = await getConnection();
    
    const result = await pool.execute("SELECT * FROM Terapista WHERE id_terapista = :id_terapista",
    [id_terapista]);
    closeConnection(pool);
    
    if(!result.rows[0]) throw new Error(em.NO_ENCONTRE_TERAPISTAS);
    
    var terapista = [result.rows[0][0], result.rows[0][1], result.rows[0][2]];
    return terapista;
    
}

async function getTrunoTerapista(id_terapista){
    const pool = await getConnection();

    const result = await pool.execute("SELECT turno FROM Terapista WHERE id_terapista = :id_terapista", [id_terapista]);

    if(!result.rows[0]) throw new Error(em.NO_ENCONTRE_TERAPISTAS);

    return result.rows[0][0];
}


const getTerapista = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    const pool= await getConnection();

    try{
        
        if(message !== "") throw new Error(message);
        
        const { id_terapista } = req.body;
        const result = await pool.execute("SELECT * FROM Terapista where id_terapista = :id_terapista", [id_terapista]);

        if(!result.rows[0]) throw new Error(em.NO_ENCONTRE_TERAPISTAS);
        return res.status(200).json({"status": "succes", "Terapistas": result.rows});
        
    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({"status": "error", "Error": error});

    }finally{
        closeConnection(pool); 
    }

}

const postTerapista = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        // Obtengo los datos del body del request
        var { id_terapista, nombre, turno } = req.body;

        // Inserto el paciente
        const result = await pool.execute(
            "INSERT INTO Terapista VALUES(:id_terapista, :nombre, :turno)",
            [id_terapista, nombre, turno]);
        
        // Verifico que se inserto el paciente
        if(result.rowsAffected < 1) throw new Error(em.NO_MODIFICO);

        // Hago un commit de los cambios
        commitPool(pool);

        // Devuelvo la respuesta
        return res.status(200).json({status: 'succes', msg: 'Terapista creado correctamente.'});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(304).json({status: 'error', error: error.message});

    }finally{
        // Finalizo la conexión con la BD.
        closeConnection(pool);                        
    }
}


const delTerapista = async (req, res) => {
    var message = "";
    message = validacionEntrada(req);

    const pool = await getConnection();
    
    try{
        if(message !== "") throw new Error(message);
        var { id_terapista } = req.body;
        await getTerapistaClase(id_terapista);
        const result = await pool
        .execute("DELETE FROM Terapista WHERE id_terapista = :id_terapista", [ id_terapista ]);
        

        if(result.rowsAffected < 1) throw new Error(em.NO_ELIMINAR); 

        commitPool(pool);

        return res.status(200).json({status: 'succes', msg: 'Terapista Eliminado.'});

    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({status: 'error', error: error.message});

    }finally{
        closeConnection(pool);                   
    }
    
}


const putTerapista = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    // Obtengo la conexion a la BD
    const pool = await getConnection();
    try{
        if(message !== "") throw new Error(message);
        var { id_terapista, turno } = req.body;
        await getTerapistaClase(id_terapista);
        const result = await pool
        .execute("UPDATE Terapista SET(turno) = (:turno) WHERE id_terapista = :id_terapista", [ turno, id_terapista ]);
        
        if(result.rowsAffected < 1) throw new Error(em.NO_MODIFICAR_TURNO_ASIGNADO); 
    
        commitPool(pool);

        return res.status(200).json({status: 'succes', msg: `Turno del Terapista ${id_terapista} Modificado.`});

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
    getTerapistaClase,
    getTrunoTerapista,
    getTerapista,
    postTerapista,
    putTerapista,
    delTerapista,

}