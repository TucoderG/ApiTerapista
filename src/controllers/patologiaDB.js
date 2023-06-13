const em = require('../errors/messages');

const getIdPatologia = async (pool, nombre_patologia) => {
       
    const result = await pool.execute("SELECT id_patologia FROM Patologia WHERE descripcion LIKE :nombre_patologia", [nombre_patologia]);
    if(!result.rows[0]) throw new Error(em.NO_ENCONTRO_PATOLOGIA);
    return result.rows[0][0];
    
}



module.exports = {
    getIdPatologia,
}