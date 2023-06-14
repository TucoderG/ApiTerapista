const em = require('../errors/messages');
const { getUsuario } = require('../controllers/usuariosession');
const jwt = require('jsonwebtoken');
const bc = require('bcrypt');

async function authenticacionToken(req, res, next){
    try{
        // Busco en los headers la autorizacion
        const authorization = req.get('Authorization')
        let token = ''
        if(authorization && authorization.toLowerCase().startsWith('bearer')){
            token = authorization.substring(7)
        }
        // Decodifico el token si es que no expiró o es erroneo
        const decodedToken = jwt.verify(token, process.env.SECRET)    
            
        if(!token || !decodedToken.id) throw new Error(em.NO_TOKEN)
      
        // Obtengo el id del usuario que obtuvo el token
        const { id } = decodedToken;

        // Verifico que exista
        const usuario = await getUsuario(id);
        if(!usuario) throw new Error(em.NO_USUARIO)
        // Guardo los datos del usuario en el request
        req.usuario = usuario;
        return next();
    }catch(error){
        
        return res.status(401).json({"status": "error", "Error": error.message});
        
    }
}

// Verifica que el usuario que acceda tiene permisos para hacerlo
async function authenticacionRolPaciente(req, res, next){
    try{
        
        if(req.usuario[2] != 'Paciente') throw new Error(em.ROL_NO_PERMITIDO);
        if(!req.body.id_usuario){
            if(req.usuario[0] != req.body.dni_paciente) throw new Error(em.NO_MANIPULAR_OTROS);
        }else{
            if(req.usuario[0] != req.body.id_usuario) throw new Error(em.NO_MANIPULAR_OTROS);
        }
        
        return next()
    }catch(error){

        return res.status(401).json({"status": "error", "Error": error.message});
    }

}

async function noRolPaciente(req, res, next){
    try{
        
        if(req.usuario[2] == 'Paciente') throw new Error(em.ROL_NO_PERMITIDO);
        
        return next()
    }catch(error){

        return res.status(401).json({"status": "error", "Error": error.message});
    }

}

async function authenticacionRolTerapista(req, res, next){
    try{
        
        if(req.usuario[2] != 'Terapista') throw new Error(em.ROL_NO_PERMITIDO);
        if(!req.body.id_usuario){
            if(req.usuario[0] != req.body.id_terapista) throw new Error(em.NO_MANIPULAR_OTROS);
        }else{
            if(req.usuario[0] != req.body.id_usuario) throw new Error(em.NO_MANIPULAR_OTROS);
        }
        return next()
    }catch(error){

        return res.status(401).json({"status": "error", "Error": error.message});
    }

}

async function authenticacionAdmin(req, res, next){
    try{
        if(req.usuario[0] != process.env.ADMINID) throw new Error(em.NO_ES_ADMIN);
        if(! await(bc.compare(process.env.ADMINPASS, req.usuario[1]))) throw new Error(em.FALLO_PASS_ADMIN);
        return next();
    }catch(error){
        return res.status(401).json({"status": "error", "Error": error.message});
    }
}


module.exports = {
    authenticacionToken,
    authenticacionRolPaciente,
    noRolPaciente,
    authenticacionRolTerapista,
    authenticacionAdmin,
}