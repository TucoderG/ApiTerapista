const { validationResult } = require('express-validator');
const { getConnection, closeConnection, commitPool } = require('../db/accesoDB');
const em = require('../errors/messages');

const getAllGeneral = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    const pool= await getConnection();
    
    try{
        if(!(message === "")) throw new Error(message);
        const { tabla } = req.body;
        const result = await pool.execute(`SELECT * FROM ${tabla}`);
        if(!result.rows[0]) throw new Error(em.NO_REGISTROS);
        return res.status(200).json({"status": "succes", tabla: result.rows});
        
    }catch(error){
        return res.status(404).json({"status": "error", "Error": error.message});

    }finally{
        closeConnection(pool); 
    }

}

const validacionEntrada = (req) => {
    var message = "";
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        for(error in errors.array()){
            message += `${errors.array()[error].msg}  `; 
        }
        return message;
    }
    return message;
    
}



module.exports = {
    getAllGeneral,
    validacionEntrada,
}