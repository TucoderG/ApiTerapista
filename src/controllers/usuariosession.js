const em = require('../errors/messages');
const { getConnection, closeConnection, commitPool } = require('../db/accesoDB');
const bc = require('bcrypt');


// Elimino un usuario en base a su ID y Contraseña
async function delUsuarioDB(id_usuario, password){
    const pool = await getConnection();

    const rta = await getUsuario(id_usuario);
    if(!rta) throw new Error(em.USUARIO_NO_ENCONTRADO);

    if(!(await bc.compare(password, rta[1]))) throw new Error('No coinciden las conteaseñas..');
    
    const result = await pool.execute("DELETE FROM Usuario WHERE id_usuario = :id_usuario", 
    [id_usuario]);
    
    if(result.rowsAffected<1) throw new Error(em.USUARIO_NO_ELIMINADO);

    commitPool(pool);
    closeConnection(pool);
    return;
}


// Obtengo un usuario mediante su ID
async function getUsuario(id_usuario){
    const pool = await getConnection();

    const result = await pool.execute("SELECT * FROM Usuario WHERE id_usuario = :id_usuario",
    [id_usuario]);
    
    if(result.rowsAffected<1) throw new Error(em.USUARIO_NO_ENCONTRADO);
    closeConnection(pool);
    
    return result.rows[0];
 
}


// Creo un usuario a partir de su i(Paciente o Terapista) y una contraseña Codificada
async function postUsuario(id_usuario, password){
    var rta;
    var result;
    const pool = await getConnection();
    const saltRounds = await bc.genSalt(10);
    const hash = await bc.hash(password, saltRounds);
    
    if(id_usuario >= 1_000_000 && id_usuario <= 999_999_999){
        rta = await pool.execute("SELECT * FROM Paciente WHERE dni = :id_usuario", [id_usuario]);
        
        if(!rta.rows[0]) throw new Error(em.USUARIO_NO_ENCONTRADO);
        
        result = await pool.execute("INSERT INTO Usuario VALUES(:id_usuario, :hash, 'Paciente')",
        [id_usuario, hash]);
    }else{
        rta = await pool.execute("SELECT * FROM Terapista WHERE id_terapista = :id_usuario", [id_usuario]);
        
        if(!rta.rows[0]) throw new Error(em.NO_ENCONTRE_TERAPISTAS);
        result = await pool.execute("INSERT INTO Usuario VALUES(:id_usuario, :hash, 'Terapista')",
        [id_usuario, hash]);
        
    }

    
    
    if(result.rowsAffected<1) throw new Error(em.USUARIO_NO_INSERTADO);
        
    commitPool(pool);

    closeConnection(pool);

}

module.exports = {
    getUsuario,
    postUsuario,
    delUsuarioDB,
}