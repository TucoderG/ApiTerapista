const em = require('../errors/messages');
const { validacionEntrada } = require('./funcionesGeneralesDB');
const { getUsuario, postUsuario , delUsuarioDB } = require('./usuariosession');
const jwt = require('jsonwebtoken');
const bc = require('bcrypt');


const delUser = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    try{
        if(message !== "") throw new Error(message);
        const { id_usuario, password } = req.body;
        
        await delUsuarioDB(id_usuario, password);

        return res.status(200).json({"status": "succes", "message": "Usuario eliminado correctamente!"});

        
    }catch(error){
        if(error.message.includes("Ingrese")){
            return res.status(409).json({status: 'error', error: error.message});
        }
        return res.status(404).json({"status": "Error", "message": error.message});
    }
}

const singUp = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);
    try{
        if(message !== "") throw new Error(message);
        const { id_usuario, password } = req.body;
        
        await postUsuario(id_usuario, password);

        return res.status(201).json({"status": "succes", "message": "Usuario Creado!"});
    }catch(error){
        if(error.message.includes("ORA-00001:")){
            return res.status(409).json({"status": "Error", "message": em.ORA_00001});
        }
        return res.status(404).json({"status": "Error", "message": error.message});

    }
}


const logIn = async (req, res) =>{
    var message = "";
    message = validacionEntrada(req);

    try{
        if(message !== "") throw new Error(message);
        const { id_usuario, password } = req.body;

        
        const usuario = await getUsuario(id_usuario); 
        if(!usuario) throw new Error("No existe el usuario..");
        if(!(await bc.compare(password, usuario[1]))) throw new Error('No coinciden las conteaseñas..');

        const userSesion = {
            id: id_usuario,
            pass: password
        }

        const token = jwt.sign(
            userSesion, 
            process.env.SECRET,
            {
                expiresIn: 60 * 60 * 5, //Expira en 5 dias.
            }
           
        );
        
        

        return res.status(202).json({"status": "success", "message": "Session iniciada!", "token": token});
    }catch(error){
        if(error.message.includes("ORA-00001:")){
            return res.status(409).json({"status": "Error", "message": em.ORA_00001});
        }
        return res.status(401).json({"status": "Error", "message": error.message});
    }

}

module.exports = {

    singUp,
    logIn,
    delUser,
    
}